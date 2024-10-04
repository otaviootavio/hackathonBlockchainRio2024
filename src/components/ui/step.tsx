"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

interface StepsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'value'> {
  value: number;
}

const StepsContext = React.createContext<{ value: number }>({ value: 1 });

export function Steps({ value, className, children, ...props }: StepsProps) {
  return (
    <StepsContext.Provider value={{ value }}>
      <div
        className={cn(
          "flex w-full items-center space-x-2 rounded-lg border border-border bg-background p-3 text-center text-sm font-medium text-muted-foreground shadow-sm sm:space-x-4 sm:p-4 sm:text-base",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </StepsContext.Provider>
  );
}

interface StepProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'value'> {
  value: number;
}

export function Step({ value, children, className, ...props }: StepProps) {
  const context = React.useContext(StepsContext);
  const isActive = context.value >= value;

  return (
    <li
      className={cn(
        "flex items-center",
        isActive ? "text-primary" : "",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "me-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs",
          isActive ? "border-primary" : "border-muted-foreground"
        )}
      >
        {value}
      </span>
      {children}
    </li>
  );
}

Steps.Step = Step;