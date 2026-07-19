import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        props.variant === "secondary"
          ? "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
          : "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
