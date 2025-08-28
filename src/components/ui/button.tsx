// src/components/ui/button.tsx
import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    asChild?: boolean;
    href?: string;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    variant = 'default',
    size = 'md',
    asChild,
    href,
    ...props
}) => {
    const baseStyle = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
    const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700',
        ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };
    const classes = `${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`;

    if (asChild && href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};