import { cn } from "~/lib/utils";
import * as React from "react";

type SkeletonProps = React.HTMLProps<HTMLDivElement>;

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
