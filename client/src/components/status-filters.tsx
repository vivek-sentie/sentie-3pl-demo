import { Button } from "@/components/ui/button";
import type { APStatus, ARStatus } from "@shared/schema";

interface StatusFiltersProps {
  activeTab: "ap" | "ar";
  apFilter: APStatus | "all";
  arFilter: ARStatus | "all";
  onApFilterChange: (filter: APStatus | "all") => void;
  onArFilterChange: (filter: ARStatus | "all") => void;
  apCounts: Record<APStatus | "total", number>;
  arCounts: Record<ARStatus | "total", number>;
}

export function StatusFilters({
  activeTab,
  apFilter,
  arFilter,
  onApFilterChange,
  onArFilterChange,
  apCounts,
  arCounts
}: StatusFiltersProps) {
  if (activeTab === "ap") {
    return (
      <div className="flex flex-wrap gap-2">
        <FilterButton
          label="All"
          count={apCounts.total}
          active={apFilter === "all"}
          onClick={() => onApFilterChange("all")}
          testId="filter-ap-all"
        />
        <FilterButton
          label="Received"
          count={apCounts.received}
          active={apFilter === "received"}
          onClick={() => onApFilterChange("received")}
          testId="filter-ap-received"
        />
        <FilterButton
          label="Extracting"
          count={apCounts.extracting}
          active={apFilter === "extracting"}
          onClick={() => onApFilterChange("extracting")}
          testId="filter-ap-extracting"
        />
        <FilterButton
          label="Matching"
          count={apCounts.matching}
          active={apFilter === "matching"}
          onClick={() => onApFilterChange("matching")}
          testId="filter-ap-matching"
        />
        <FilterButton
          label="Auditing"
          count={apCounts.auditing}
          active={apFilter === "auditing"}
          onClick={() => onApFilterChange("auditing")}
          testId="filter-ap-auditing"
        />
        <FilterButton
          label="Disputed"
          count={apCounts.disputed}
          active={apFilter === "disputed"}
          onClick={() => onApFilterChange("disputed")}
          testId="filter-ap-disputed"
        />
        <FilterButton
          label="Approved"
          count={apCounts.approved}
          active={apFilter === "approved"}
          onClick={() => onApFilterChange("approved")}
          testId="filter-ap-approved"
        />
        <FilterButton
          label="Paid"
          count={apCounts.paid}
          active={apFilter === "paid"}
          onClick={() => onApFilterChange("paid")}
          testId="filter-ap-paid"
        />
        <FilterButton
          label="Input Required"
          count={apCounts.input_required}
          active={apFilter === "input_required"}
          onClick={() => onApFilterChange("input_required")}
          testId="filter-ap-input-required"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <FilterButton
        label="All"
        count={arCounts.total}
        active={arFilter === "all"}
        onClick={() => onArFilterChange("all")}
        testId="filter-ar-all"
      />
      <FilterButton
        label="Collecting"
        count={arCounts.collecting}
        active={arFilter === "collecting"}
        onClick={() => onArFilterChange("collecting")}
        testId="filter-ar-collecting"
      />
      <FilterButton
        label="Calculating"
        count={arCounts.calculating}
        active={arFilter === "calculating"}
        onClick={() => onArFilterChange("calculating")}
        testId="filter-ar-calculating"
      />
      <FilterButton
        label="Generated"
        count={arCounts.generated}
        active={arFilter === "generated"}
        onClick={() => onArFilterChange("generated")}
        testId="filter-ar-generated"
      />
      <FilterButton
        label="For Review"
        count={arCounts.for_review}
        active={arFilter === "for_review"}
        onClick={() => onArFilterChange("for_review")}
        testId="filter-ar-for-review"
      />
      <FilterButton
        label="Sent"
        count={arCounts.sent}
        active={arFilter === "sent"}
        onClick={() => onArFilterChange("sent")}
        testId="filter-ar-sent"
      />
      <FilterButton
        label="Paid"
        count={arCounts.paid}
        active={arFilter === "paid"}
        onClick={() => onArFilterChange("paid")}
        testId="filter-ar-paid"
      />
      <FilterButton
        label="Input Required"
        count={arCounts.input_required}
        active={arFilter === "input_required"}
        onClick={() => onArFilterChange("input_required")}
        testId="filter-ar-input-required"
      />
    </div>
  );
}

function FilterButton({
  label,
  count,
  active,
  onClick,
  testId
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  testId: string;
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="gap-1.5"
      data-testid={testId}
    >
      {label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-primary-foreground/20' : 'bg-muted'
        }`}>
        {count}
      </span>
    </Button>
  );
}
