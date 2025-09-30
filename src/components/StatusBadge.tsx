import * as React from "react";
import { 
  Clock, 
  Search, 
  UserCheck, 
  CheckCircle, 
  XCircle, 
  Calendar,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TicketStatus, type StatusBadgeProps } from "@/lib/types/warranty-tracker";

// Icon mapping for each status
const STATUS_ICONS: Record<TicketStatus, LucideIcon> = {
  [TicketStatus.PENDING]: Clock,
  [TicketStatus.VALIDATED]: Search,
  [TicketStatus.MANAGER_REVIEW]: UserCheck,
  [TicketStatus.APPROVED]: CheckCircle,
  [TicketStatus.REJECTED]: XCircle,
  [TicketStatus.SCHEDULED]: Calendar,
};

// Status text mapping
const STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.PENDING]: 'Submitted',
  [TicketStatus.VALIDATED]: 'Under Review',
  [TicketStatus.MANAGER_REVIEW]: 'Manager Review',
  [TicketStatus.APPROVED]: 'Approved',
  [TicketStatus.REJECTED]: 'Rejected',
  [TicketStatus.SCHEDULED]: 'Service Scheduled',
};

// Status color mapping using theme colors
const STATUS_STYLES: Record<TicketStatus, string> = {
  [TicketStatus.PENDING]: 'bg-muted text-muted-foreground border-muted',
  [TicketStatus.VALIDATED]: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  [TicketStatus.MANAGER_REVIEW]: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
  [TicketStatus.APPROVED]: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  [TicketStatus.REJECTED]: 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/40',
  [TicketStatus.SCHEDULED]: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/40',
};

// Size variants
const SIZE_STYLES = {
  sm: 'text-xs px-2 py-0.5 [&>svg]:size-3',
  md: 'text-sm px-2.5 py-1 [&>svg]:size-3.5',
  lg: 'text-base px-3 py-1.5 [&>svg]:size-4',
};

/**
 * StatusBadge component for displaying warranty ticket status
 */
export function StatusBadge({ 
  status, 
  className, 
  size = 'md' 
}: StatusBadgeProps) {
  const Icon = STATUS_ICONS[status];
  const label = STATUS_LABELS[status];
  const statusStyles = STATUS_STYLES[status];
  const sizeStyles = SIZE_STYLES[size];

  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center justify-center rounded-md border font-medium w-fit whitespace-nowrap shrink-0 gap-1.5 transition-colors overflow-hidden',
        statusStyles,
        sizeStyles,
        className
      )}
    >
      <Icon className="shrink-0" />
      <span>{label}</span>
    </span>
  );
}

export default StatusBadge;