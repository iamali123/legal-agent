import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[14px] text-sm font-medium ring-offset-background transition-colors transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'gradient-vertical-cyan text-white hover:opacity-90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, style, ...props }, ref) => {
    // Apply global gradient style to all buttons (can be overridden by variant or custom style)
    const shouldApplyGradient = variant === 'default' || variant === undefined || variant === 'gradient'
    const gradientStyle = shouldApplyGradient
      ? {
          background: 'linear-gradient(180deg, #00D9FF 0%, #00A8B5 100%)',
          boxShadow: '0px 0px 59.8px 0px #00D9FF4D, 0px 0px 29.9px 0px #00D9FF98',
          transition: 'all 0.3s ease',
          ...style,
        }
      : style

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          shouldApplyGradient && 'text-white hover:brightness-110 hover:shadow-[0px_0px_70px_0px_#00D9FF66,0px_0px_40px_0px_#00D9FFB3]'
        )}
        style={gradientStyle}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
