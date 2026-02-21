"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, RotateCcw, Loader2 } from "lucide-react"

interface UrlAuditFormProps {
  url: string
  onUrlChange: (url: string) => void
  onAudit: () => void
  onReset: () => void
  isLoading: boolean
}

export function UrlAuditForm({
  url,
  onUrlChange,
  onAudit,
  onReset,
  isLoading,
}: UrlAuditFormProps) {
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (!url.trim() || isLoading) return
        onAudit()
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="url-input" className="text-sm font-medium text-foreground">
          URL to audit
        </Label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="url-input"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Audit
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={onReset}
              disabled={isLoading}
              className="gap-2"
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Only http/https URLs are supported.
          </p>
          <button
            type="button"
            onClick={() => onUrlChange("https://example.com")}
            disabled={isLoading}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            Try sample URL
          </button>
        </div>
      </div>
    </form>
  )
}
