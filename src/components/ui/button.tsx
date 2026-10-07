import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#ec4899] text-white shadow-[0_4px_14px_rgba(236,72,153,0.3)] hover:bg-[#db2777] hover:shadow-[0_6px_20px_rgba(236,72,153,0.35)]",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-[#fecdd3] bg-white text-[#881337] hover:bg-[#fff1f2] hover:border-[#fda4af] shadow-sm",
        secondary: "bg-[#fff1f2] text-[#881337] hover:bg-[#ffe4e6] border border-[#fecdd3]",
        ghost: "text-[#881337] hover:bg-[#fff1f2] hover:text-[#be123c]",
        soft: "bg-[#ffe4e6] text-[#be123c] hover:bg-[#fecdd3]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-8 text-[15px]",
        icon: "h-10 w-10",
        pill: "h-8 px-4 rounded-full text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
