"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { CommunicationFilters } from "@/components/communications/communication-filters";

interface CommunicationFiltersWrapperProps {
  defaultType: string;
  defaultSearch: string;
  defaultLoad: string;
}

export function CommunicationFiltersWrapper({
  defaultType,
  defaultSearch,
  defaultLoad,
}: CommunicationFiltersWrapperProps) {
  const router = useRouter();

  const buildUrl = useCallback(
    (type: string, search: string, load: string) => {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (search) params.set("search", search);
      if (load) params.set("load", load);
      const qs = params.toString();
      return `/communications${qs ? `?${qs}` : ""}`;
    },
    []
  );

  function handleTypeFilterChange(value: string) {
    router.push(buildUrl(value, defaultSearch, defaultLoad));
  }

  function handleSearchChange(value: string) {
    router.push(buildUrl(defaultType, value, defaultLoad));
  }

  function handleLoadNumberChange(value: string) {
    router.push(buildUrl(defaultType, defaultSearch, value));
  }

  return (
    <CommunicationFilters
      typeFilter={defaultType}
      searchQuery={defaultSearch}
      loadNumber={defaultLoad}
      onTypeFilterChange={handleTypeFilterChange}
      onSearchChange={handleSearchChange}
      onLoadNumberChange={handleLoadNumberChange}
    />
  );
}
