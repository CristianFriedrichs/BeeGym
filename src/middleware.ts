import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: any[]) {
                    cookiesToSet.forEach(({ name, value }) => {
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

    // 🔒 Verificar sessão
    const {
        data: { session },
    } = await supabase.auth.getSession()

    const url = request.nextUrl.clone()
    const isAuthPage = url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/register') ||
        url.pathname.startsWith('/signup')

    const isPublicRoute = url.pathname.startsWith('/api/webhook') ||
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/favicon') ||
        url.pathname.includes('.')

    const isProtectedRoute = !isAuthPage && !isPublicRoute

    // 1. Redirecionar não autenticados
    if (!session && isProtectedRoute) {
        url.pathname = '/login'
        url.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // 2. Redirecionar autenticados que tentam acessar login
    if (session && isAuthPage) {
        const redirect = request.nextUrl.searchParams.get('redirect')
        if (redirect) {
            return NextResponse.redirect(new URL(redirect, request.url))
        }
        return NextResponse.redirect(new URL('/', request.url))
    }

    // 3. 🔒 VALIDAÇÃO EXTRA: Verificar organization_id e status no banco
    if (session && isProtectedRoute) {
        // Ignorar verificação para a página de ativação pendente para evitar loop
        if (url.pathname.startsWith('/pending-activation') || url.pathname.startsWith('/onboarding')) {
            return response
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('organization_id, status')
            .eq('id', session.user.id)
            .single()

        if (error || !profile?.organization_id) {
            console.error('🚨 SECURITY: Usuário sem organization_id detectado ou erro no perfil')
            // Removido o logout automático. Redirecionar para onboarding para completar o cadastro.
            url.pathname = '/onboarding'
            return NextResponse.redirect(url)
        }

        if (profile.status !== 'ACTIVE') {
            // Se o status não for ACTIVE, redirecionar para onboarding ou pending-activation
            url.pathname = '/onboarding'
            return NextResponse.redirect(url)
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
