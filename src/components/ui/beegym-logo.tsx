'use client';

import { cn } from '@/lib/utils';

interface BeeGymLogoProps {
    variant?: 'light' | 'dark';
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    className?: string;
}

export function BeeGymLogo({
    variant = 'light',
    size = 'md',
    showIcon = true,
    className
}: BeeGymLogoProps) {
    const sizeClasses = {
        sm: 'text-xl gap-1.5',
        md: 'text-2xl gap-2',
        lg: 'text-4xl gap-3',
    };

    const iconSizes = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className={cn('flex items-center', sizeClasses[size], className)}>
            {showIcon && (
                <div className={cn('rounded-full bg-gradient-to-br from-bee-orange to-orange-600 flex items-center justify-center', iconSizes[size])}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-3/5 h-3/5">
                        <path
                            d="M12 2L15.5 8.5L22 9.5L17 14.5L18.5 21L12 17.5L5.5 21L7 14.5L2 9.5L8.5 8.5L12 2Z"
                            fill="white"
                            opacity="0.9"
                        />
                    </svg>
                </div>
            )}
            <span className="font-display font-bold tracking-tight">
                <span className="text-bee-orange">Bee</span>
                <span className={variant === 'dark' ? 'text-pure-white' : 'text-deep-midnight'}>
                    Gym
                </span>
            </span>
        </div>
    );
}
