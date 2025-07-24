import { cn } from '@/app/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        className={cn(
          'rounded-lg font-medium transition-colors flex items-center justify-center',
          {
            'bg-teal-500 text-white hover:bg-teal-600': variant === 'primary',
            'bg-gray-100 text-gray-800 hover:bg-gray-200': variant === 'secondary',
            'border border-solid border-gray-300 hover:bg-gray-50': variant === 'outline',
            'text-sm h-9 px-3': size === 'sm',
            'text-base h-10 px-4': size === 'md',
            'text-lg h-12 px-6': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
