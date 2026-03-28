import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Reusable Badge component for status indicators.
 */

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-800 text-slate-100",
        secondary: "border-transparent bg-slate-700 text-slate-300",
        destructive: "border-transparent bg-red-600/20 text-red-500 border-red-500/50",
        outline: "text-slate-100",
        emergency: "border-transparent bg-red-600 text-white animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]",
        active: "border-transparent bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]",
        success: "border-transparent bg-green-600 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
