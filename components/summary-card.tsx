"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Clock,
  FileCode2,
  ExternalLink,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { AuditResponse } from "@/src/audit/types"

interface SummaryCardProps {
  data: AuditResponse
}

function ScoreRing({ score }: { score: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 80
      ? "text-success"
      : score >= 50
        ? "text-warning"
        : "text-destructive"

  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/60"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-700 ease-out", color)}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-2xl font-bold", color)}>{score}</span>
        <span className="text-[10px] font-medium text-muted-foreground">/ 100</span>
      </div>
    </div>
  )
}

export function SummaryCard({ data }: SummaryCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    return `${Math.round(bytes / 1024)} KB`
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-5">
            <ScoreRing score={data.summary.score} />
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2">
                <ExternalLink className="size-3.5 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground break-all">
                  {data.url}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="gap-1.5 bg-success text-success-foreground border-transparent">
                  <CheckCircle2 className="size-3" />
                  {data.summary.passes} Passes
                </Badge>
                <Badge className="gap-1.5 bg-warning text-warning-foreground border-transparent">
                  <AlertTriangle className="size-3" />
                  {data.summary.warnings} Warnings
                </Badge>
                <Badge variant="destructive" className="gap-1.5">
                  <XCircle className="size-3" />
                  {data.summary.fails} Fails
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  Fetch time: {data.meta.fetchTimeMs}ms
                </span>
                <span className="flex items-center gap-1">
                  <FileCode2 className="size-3" />
                  HTML size: {formatBytes(data.meta.htmlBytes)}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={handleCopyJson}
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy JSON"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
