"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TYPE_OPTIONS } from "@/lib/communications/types";

interface CommunicationFiltersProps {
  typeFilter: string;
  searchQuery: string;
  loadNumber: string;
  onTypeFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onLoadNumberChange: (value: string) => void;
}

export function CommunicationFilters({
  typeFilter,
  searchQuery,
  loadNumber,
  onTypeFilterChange,
  onSearchChange,
  onLoadNumberChange,
}: CommunicationFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by keyword..."
          className="w-56 pl-9 h-9 text-sm"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Input
        placeholder="Load number..."
        className="w-40 h-9 text-sm"
        value={loadNumber}
        onChange={(e) => onLoadNumberChange(e.target.value)}
      />
    </div>
  );
}
