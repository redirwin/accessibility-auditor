"use client"

import { cn } from "@/lib/utils"

export type AppState = "idle" | "loading" | "success" | "error"
export type SimulatorState = "auto" | AppState

interface StateSimulatorProps {
  state: SimulatorState
  onStateChange: (state: SimulatorState) => void
  className?: string
}

const states: { value: SimulatorState; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "idle", label: "Idle" },
  { value: "loading", label: "Loading" },
  { value: "success", label: "Success" },
  { value: "error", label: "Error" },
]

export function StateSimulator({
  state,
  onStateChange,
  className,
}: StateSimulatorProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 px-3 py-2",
      className
    )}>
      <span className="text-xs font-medium text-muted-foreground">Simulate (dev only):</span>
      <div className="flex gap-1">
        {states.map((s) => (
          <button
            key={s.value}
            onClick={() => onStateChange(s.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              state === s.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
