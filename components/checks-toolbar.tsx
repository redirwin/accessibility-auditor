"use client"

import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import type { AuditStatus } from "@/src/audit/types"

export type FilterStatus = "all" | AuditStatus
export type SortOption = "severity" | "name"

interface ChecksToolbarProps {
  search: string
  onSearchChange: (search: string) => void
  filter: FilterStatus
  onFilterChange: (filter: FilterStatus) => void
  sort: SortOption
  onSortChange: (sort: SortOption) => void
}

export function ChecksToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
}: ChecksToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Filter checks..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex items-center gap-3">
        <Tabs
          value={filter}
          onValueChange={(v) => onFilterChange(v as FilterStatus)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pass">Pass</TabsTrigger>
            <TabsTrigger value="warn">Warn</TabsTrigger>
            <TabsTrigger value="fail">Fail</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger size="sm" className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="severity">Severity</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
