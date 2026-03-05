import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MailOpen, FileText, Package, CheckCircle, AlertTriangle, AlertCircle, Calculator, DollarSign, Clock, Send } from "lucide-react";
import type { Activity } from "@shared/schema";

// Map of activity types to icons
const activityIcons: Record<string, React.ElementType> = {
  email_received: MailOpen,
  email_sent: Send,
  email_draft: Mail,
  data_extracted: FileText,
  order_matched: Package,
  rate_verified: CheckCircle,
  discrepancy_found: AlertTriangle,
  dispute_filed: AlertCircle,
  dispute_resolved: CheckCircle,
  charges_calculated: Calculator,
  invoice_generated: FileText,
  audit_complete: CheckCircle,
  payment_sent: DollarSign,
  payment_received: DollarSign,
};

// Map of activity types to colors
const activityColors: Record<string, string> = {
  email_received: "text-blue-500",
  email_sent: "text-green-500",
  email_draft: "text-amber-500",
  data_extracted: "text-cyan-500",
  order_matched: "text-indigo-500",
  rate_verified: "text-emerald-500",
  discrepancy_found: "text-red-500",
  dispute_filed: "text-orange-500",
  dispute_resolved: "text-green-600",
  charges_calculated: "text-violet-500",
  invoice_generated: "text-blue-600",
  audit_complete: "text-emerald-600",
  payment_sent: "text-green-500",
  payment_received: "text-green-600",
};

interface ActivityStreamProps {
  activities: Activity[];
  emptyMessage?: string;
  onAction?: (activity: Activity) => void;
}

export function ActivityStream({ activities, emptyMessage = "No activities yet", onAction }: ActivityStreamProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3 pr-4">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} onAction={onAction} />
        ))}
      </div>
    </ScrollArea>
  );
}

function ActivityItem({ activity, onAction }: { activity: Activity; onAction?: (activity: Activity) => void }) {
  const Icon = activityIcons[activity.type] || Clock;
  const colorClass = activityColors[activity.type] || "text-muted-foreground";
  const isPending = activity.metadata?.pendingAction === true;
  const timeStr = activity.timestamp.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className={`flex gap-3 p-3 rounded-lg border transition-colors ${isPending ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' : 'bg-muted/30 border-transparent hover:bg-muted/50'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-background border ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-sm truncate">{activity.title}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">{timeStr}</span>
        </div>
        <p className="text-xs text-muted-foreground">{activity.description}</p>
        {activity.metadata?.document && (
          <a
            href={(activity.metadata.document as { url: string }).url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1 text-xs text-primary hover:underline"
          >
            <FileText className="w-3 h-3" />
            {(activity.metadata.document as { name: string }).name}
          </a>
        )}
        {isPending && onAction && (
          <div className="mt-2">
            <Button size="sm" variant="default" onClick={() => onAction(activity)} className="h-7 text-xs">
              Review & Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
