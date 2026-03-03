import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3.5 py-1 text-[0.72rem] font-medium uppercase tracking-[0.06em] transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-ink/10 text-ink",
        coral: "bg-coral/10 text-coral",
        mint: "bg-mint/12 text-[#00b87a]",
        yellow: "bg-yellow/25 text-[#8a6d00]",
        outline: "text-ink border border-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
