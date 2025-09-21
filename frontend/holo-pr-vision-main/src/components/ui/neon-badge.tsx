import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const neonBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
        success: "border-success/30 bg-success/10 text-success hover:bg-success/20",
        warning: "border-warning/30 bg-warning/10 text-warning hover:bg-warning/20",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
        accent: "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20",
        neon: "border-neon-blue/50 bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 animate-pulse-glow",
        ghost: "border-muted/30 bg-transparent text-muted-foreground hover:bg-muted/10",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
      glow: {
        none: "",
        subtle: "shadow-lg shadow-current/20",
        strong: "shadow-xl shadow-current/40 animate-pulse-glow",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "none",
    },
  }
);

export interface NeonBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof neonBadgeVariants> {}

function NeonBadge({ className, variant, size, glow, ...props }: NeonBadgeProps) {
  return (
    <div
      className={cn(neonBadgeVariants({ variant, size, glow }), className)}
      {...props}
    />
  );
}

export { NeonBadge, neonBadgeVariants };