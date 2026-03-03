import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-ink text-cream shadow-[0_6px_20px_rgba(26,23,20,0.18)] hover:-translate-y-[3px] hover:shadow-[0_10px_25px_rgba(26,23,20,0.25)]",
        coral: "bg-coral text-white shadow-[0_4px_16px_rgba(255,92,58,0.3)] hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(255,92,58,0.4)]",
        mint: "bg-mint text-ink hover:-translate-y-[3px] hover:shadow-md",
        outline: "border-[1.5px] border-ink bg-transparent text-ink hover:bg-ink hover:text-cream",
        ghost: "bg-coral/10 text-coral hover:bg-coral/20",
        link: "text-coral underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2", // md
        sm: "h-9 px-4 text-xs", // sm
        lg: "h-14 px-8 text-base", // lg
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
