"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { AuditCheck } from "@/src/audit/types"

interface CheckItemProps {
  check: AuditCheck
}

const statusConfig = {
  pass: {
    icon: CheckCircle2,
    className: "bg-success text-success-foreground border-transparent",
    label: "Pass",
  },
  warn: {
    icon: AlertTriangle,
    className: "bg-warning text-warning-foreground border-transparent",
    label: "Warn",
  },
  fail: {
    icon: XCircle,
    className: "bg-destructive text-destructive-foreground border-transparent",
    label: "Fail",
  },
} as const

export function CheckItem({ check }: CheckItemProps) {
  const [open, setOpen] = useState(false)
  const config = statusConfig[check.status]
  const StatusIcon = config.icon

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/50 data-[state=open]:rounded-b-none">
        <Badge className={cn("gap-1 shrink-0 text-xs", config.className)}>
          <StatusIcon className="size-3" />
          {config.label}
        </Badge>
        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">
              {check.title}
            </span>
            {check.count !== undefined && (
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {check.count} {check.count === 1 ? "issue" : "issues"}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate">
            {check.hint}
          </span>
        </div>
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-90"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
        <div className="rounded-b-lg border border-t-0 bg-muted/30 px-4 py-3">
          <p className="text-sm text-foreground leading-relaxed mb-3">
            {check.details?.summary ?? "No additional details available."}
          </p>
          {(check.details?.examples?.length ?? 0) > 0 && (
            <ul className="flex flex-col gap-1.5">
              {check.details?.examples?.map((example, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                  <code className="font-mono break-all">{example}</code>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
