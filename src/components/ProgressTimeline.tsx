import React from 'react';
import { 
  Clock, 
  Search, 
  UserCheck, 
  CheckCircle, 
  Calendar,
  type LucideIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  type ProgressTimelineProps, 
  type TimelineStage 
} from "@/lib/types/warranty-tracker";
import { generateTimelineStages } from "@/lib/utils/warranty-tracker";

// Icon mapping for each timeline stage
const STAGE_ICONS: Record<string, LucideIcon> = {
  submitted: Clock,
  under_review: Search,
  manager_review: UserCheck,
  approved: CheckCircle,
  scheduled: Calendar
};

// Status color mapping using theme colors
const STATUS_COLORS = {
  completed: {
    bg: 'bg-success',
    text: 'text-success-foreground',
    border: 'border-success',
    icon: 'text-success-foreground'
  },
  current: {
    bg: 'bg-primary',
    text: 'text-primary-foreground',
    border: 'border-primary',
    icon: 'text-primary-foreground'
  },
  pending: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-muted',
    icon: 'text-muted-foreground'
  },
  rejected: {
    bg: 'bg-destructive',
    text: 'text-destructive-foreground',
    border: 'border-destructive',
    icon: 'text-destructive-foreground'
  }
};

/**
 * Individual timeline stage component
 */
interface TimelineStageItemProps {
  stage: TimelineStage;
  isLast: boolean;
  isHorizontal: boolean;
}

function TimelineStageItem({ stage, isLast, isHorizontal }: TimelineStageItemProps) {
  const Icon = STAGE_ICONS[stage.id] || Clock;
  const colors = STATUS_COLORS[stage.status];
  
  return (
    <div className={cn(
      "flex items-center transition-all duration-300 ease-in-out",
      isHorizontal ? "flex-col text-center" : "flex-row space-x-4"
    )}>
      {/* Stage Icon and Connector */}
      <div className={cn(
        "relative flex items-center justify-center",
        isHorizontal ? "flex-col" : "flex-row"
      )}>
        {/* Icon Circle */}
        <div className={cn(
          "flex items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out",
          "w-10 h-10 md:w-12 md:h-12",
          colors.bg,
          colors.border,
          stage.status === 'current' && "ring-2 ring-primary/20 ring-offset-2"
        )}>
          <Icon className={cn(
            "transition-all duration-300 ease-in-out",
            "w-5 h-5 md:w-6 md:h-6",
            colors.icon
          )} />
        </div>
        
        {/* Connector Line */}
        {!isLast && (
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            isHorizontal 
              ? "w-0.5 h-8 md:h-12 mt-2" 
              : "h-0.5 w-8 md:w-12 ml-2",
            stage.status === 'completed' 
              ? "bg-success" 
              : stage.status === 'rejected'
              ? "bg-destructive"
              : "bg-muted"
          )} />
        )}
      </div>
      
      {/* Stage Content */}
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isHorizontal ? "mt-3 max-w-32" : "ml-0"
      )}>
        <h4 className={cn(
          "font-semibold transition-colors duration-300",
          "text-sm md:text-base",
          stage.status === 'current' ? "text-primary" : "text-foreground"
        )}>
          {stage.label}
        </h4>
        
        {stage.description && (
          <p className={cn(
            "text-xs md:text-sm text-muted-foreground mt-1 transition-colors duration-300",
            isHorizontal ? "line-clamp-2" : ""
          )}>
            {stage.description}
          </p>
        )}
        
        {stage.timestamp && (
          <p className="text-xs text-muted-foreground mt-1">
            {(() => {
              const date = typeof stage.timestamp === 'string' ? new Date(stage.timestamp) : stage.timestamp;
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
            })()}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Main ProgressTimeline component
 */
export function ProgressTimeline({ 
  currentStatus, 
  createdAt, 
  managerAction,
  className 
}: ProgressTimelineProps) {
  // Generate timeline stages based on current status
  // Convert string dates to Date objects if needed
  const createdAtDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const managerActionDate = managerAction?.actionDate 
    ? (typeof managerAction.actionDate === 'string' ? new Date(managerAction.actionDate) : managerAction.actionDate)
    : undefined;
  
  const stages = generateTimelineStages(
    currentStatus,
    createdAtDate,
    managerActionDate,
    undefined // appointment date will be handled in a future task
  );

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Horizontal Layout */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between space-x-4">
          {stages.map((stage, index) => (
            <TimelineStageItem
              key={stage.id}
              stage={stage}
              isLast={index === stages.length - 1}
              isHorizontal={true}
            />
          ))}
        </div>
      </div>
      
      {/* Mobile Vertical Layout */}
      <div className="block md:hidden">
        <div className="space-y-6">
          {stages.map((stage, index) => (
            <TimelineStageItem
              key={stage.id}
              stage={stage}
              isLast={index === stages.length - 1}
              isHorizontal={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProgressTimeline;