import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
      variants: {
        variant: {
          default:
            'border-primary/50 bg-primary/20 text-primary-foreground hover:bg-primary/30',
          secondary:
            'border-secondary/50 bg-secondary/20 text-secondary-foreground hover:bg-secondary/30',
          destructive:
            'border-destructive/50 bg-destructive/20 text-destructive-foreground hover:bg-destructive/30',
          outline: 'border-border text-foreground bg-background/50',
          draft: 'border-orange-400/50 bg-orange-700/20 text-orange-400',
          active: 'border-green-400/50 bg-green-700/20 text-green-400',
          expiring: 'border-orange-500/50 bg-orange-600/30 text-orange-300',
          pending: 'border-orange-500/50 bg-orange-600/30 text-orange-300',
          type: 'border-blue-500/50 bg-blue-600/30 text-blue-300',
          clean: 'border-green-400/50 bg-green-700/20 text-green-400',
        },
      },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
