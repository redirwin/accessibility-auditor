"use client"

import { useMemo, useState } from "react"
import { SummaryCard } from "@/components/summary-card"
import { ChecksToolbar, type FilterStatus, type SortOption } from "@/components/checks-toolbar"
import { CheckItem } from "@/components/check-item"
import type { AuditResponse, AuditCheck } from "@/src/audit/types"

interface ResultsPanelProps {
  data: AuditResponse
}

const severityOrder: Record<string, number> = {
  fail: 0,
  warn: 1,
  pass: 2,
}

export function ResultsPanel({ data }: ResultsPanelProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [sort, setSort] = useState<SortOption>("severity")

  const filteredChecks = useMemo(() => {
    let checks: AuditCheck[] = [...data.checks]

    if (filter !== "all") {
      checks = checks.filter((c) => c.status === filter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      checks = checks.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.hint.toLowerCase().includes(q)
      )
    }

    checks.sort((a, b) => {
      if (sort === "severity") {
        return severityOrder[a.status] - severityOrder[b.status]
      }
      return a.title.localeCompare(b.title)
    })

    return checks
  }, [data.checks, search, filter, sort])

  return (
    <div className="flex flex-col gap-6">
      <SummaryCard data={data} />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Checks</h2>
        <ChecksToolbar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          sort={sort}
          onSortChange={setSort}
        />
        <div className="flex flex-col gap-2">
          {filteredChecks.length > 0 ? (
            filteredChecks.map((check) => (
              <CheckItem key={check.id} check={check} />
            ))
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed py-8 text-sm text-muted-foreground">
              No checks match your filter.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
