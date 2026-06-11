import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border',
  {
    variants: {
      variant: {
        default:  'bg-gray-100 text-gray-600 border-gray-200',
        indigo:   'bg-indigo-50 text-indigo-600 border-indigo-100',
        green:    'bg-green-50 text-green-700 border-green-100',
        amber:    'bg-amber-50 text-amber-700 border-amber-100',
        red:      'bg-red-50 text-red-700 border-red-100',
        violet:   'bg-violet-50 text-violet-700 border-violet-100',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
