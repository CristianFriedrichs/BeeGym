import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Basic Supabase Client for Middleware (Handling Cookies)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Auth Guard Logic
    const {
        data: { session },
    } = await supabase.auth.getSession()

    const url = request.nextUrl.clone()
    const isLoginPage = url.pathname === '/login' || url.pathname === '/register'
    const isOnboardingPage = url.pathname === '/onboarding'
    const isAuthRoute = url.pathname.startsWith('/auth')
    const isPublicStatic = url.pathname.startsWith('/_next') || url.pathname.includes('.')

    // 1. No Session: Redirect to Login
    if (!session && !isLoginPage && !isAuthRoute && !isPublicStatic) {
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // 2. Has Session: Check User Status (Active vs Pending)
    if (session && !isAuthRoute && !isPublicStatic) {

        // Prevent logged in users from accessing login/register
        if (isLoginPage) {
            url.pathname = '/'
            return NextResponse.redirect(url)
        }

        // Only perform DB check if we are navigating critical flows

        // Fetch User Profile to check 'active' status
        const { data: userData } = await supabase
            .from('users')
            .select('active')
            .eq('id', session.user.id)
            .single()

        // If !active (false/null), user is PENDING -> Force Onboarding
        // If active (true), user is ACTIVE -> Allow Dashboard

        const isActive = userData?.active === true

        // Logic A: Incomplete Onboarding (!active)
        if (!isActive) {
            // If NOT on onboarding page, force redirect
            if (!isOnboardingPage) {
                url.pathname = '/onboarding'
                return NextResponse.redirect(url)
            }
            // If ON onboarding page, ALLOW (no action needed)
        }

        // Logic B: Complete Onboarding (active)
        if (isActive) {
            // If trying to access onboarding again, redirect to Dashboard
            if (isOnboardingPage) {
                url.pathname = '/'
                return NextResponse.redirect(url)
            }
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
