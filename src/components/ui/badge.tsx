import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#ec4899] text-white shadow-sm",
        secondary: "border-[#fecdd3] bg-[#fff1f2] text-[#881337]",
        outline: "border-[#fecdd3] bg-white text-[#881337]",
        success: "border-transparent bg-[#ecfdf5] text-[#047857] ring-1 ring-[#a7f3d0]",
        warning: "border-transparent bg-[#fef3c7] text-[#92400e] ring-1 ring-[#fde68a]",
        peach: "border-transparent bg-[#ffe4e6] text-[#be123c]",
        coral: "border-transparent bg-[#ec4899] text-white",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
