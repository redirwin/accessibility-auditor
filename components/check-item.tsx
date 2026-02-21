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
  Copy,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
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
    className: "bg-destructive text-white border-transparent",
    label: "Fail",
  },
} as const

export function CheckItem({ check }: CheckItemProps) {
  const [open, setOpen] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const config = statusConfig[check.status]
  const StatusIcon = config.icon
  const examples = check.details?.examples ?? []
  const hasExamples = examples.length > 0
  const exampleCount = check.details?.exampleCount ?? examples.length
  const isTruncated = exampleCount > examples.length

  const handleCopy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1200)
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/50 data-[state=open]:rounded-b-none">
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
          {hasExamples && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Problem Elements
                </h4>
                {isTruncated && (
                  <span className="text-xs text-muted-foreground">
                    Showing {examples.length} of {exampleCount}
                  </span>
                )}
              </div>
              <ul className="flex flex-col gap-2">
                {examples.map((finding, i) => {
                  const selectorKey = `selector-${i}`
                  const snippetKey = `snippet-${i}`

                  return (
                    <li
                      key={i}
                      className="rounded-md border bg-background/70 px-3 py-2 text-xs text-muted-foreground"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <code className="font-mono break-all text-foreground">
                          {finding.selector}
                        </code>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          aria-label={`Copy selector example ${i + 1}`}
                          onClick={() => handleCopy(selectorKey, finding.selector)}
                        >
                          {copiedKey === selectorKey ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </Button>
                      </div>
                      <div className="mt-1 flex items-start justify-between gap-2">
                        <code className="font-mono break-all">
                          {finding.snippet}
                        </code>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          aria-label={`Copy snippet example ${i + 1}`}
                          onClick={() => handleCopy(snippetKey, finding.snippet)}
                        >
                          {copiedKey === snippetKey ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
