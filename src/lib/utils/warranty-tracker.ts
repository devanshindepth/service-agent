/**
 * Utility functions and status mapping for the Warranty Ticket Tracker
 * 
 * This file contains helper functions, status configurations, and utility methods
 * used throughout the warranty tracking system.
 */

import { 
  TicketStatus, 
  StatusConfigMap, 
  TimelineStage, 
  ErrorType,
  WarrantyTrackerError 
} from '../types/warranty-tracker';

// ================= STATUS CONFIGURATION MAPPING =================

/**
 * Configuration mapping for each ticket status including colors, labels, and descriptions
 */
export const STATUS_CONFIG: StatusConfigMap = {
  [TicketStatus.PENDING]: {
    label: 'Submitted',
    color: 'muted',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
    icon: 'Clock',
    description: 'Your warranty claim has been submitted and is awaiting initial processing.'
  },
  [TicketStatus.VALIDATED]: {
    label: 'Under Review',
    color: 'info',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: 'Search',
    description: 'Our automated system is extracting and validating your claim details.'
  },
  [TicketStatus.MANAGER_REVIEW]: {
    label: 'Manager Review',
    color: 'warning',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: 'UserCheck',
    description: 'Your claim is being reviewed by our warranty team for approval.'
  },
  [TicketStatus.APPROVED]: {
    label: 'Approved',
    color: 'success',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: 'CheckCircle',
    description: 'Your warranty claim has been approved and service center assignment is in progress.'
  },
  [TicketStatus.REJECTED]: {
    label: 'Rejected',
    color: 'destructive',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: 'XCircle',
    description: 'Your warranty claim has been rejected. Please review the details below.'
  },
  [TicketStatus.SCHEDULED]: {
    label: 'Service Scheduled',
    color: 'primary',
    bgColor: 'bg-primary/10',
    textColor: 'text-primary',
    icon: 'Calendar',
    description: 'Your service appointment has been scheduled. Please check the details below.'
  }
};

// ================= TIMELINE UTILITIES =================

/**
 * Generates timeline stages based on current ticket status
 */
export function generateTimelineStages(
  currentStatus: TicketStatus,
  createdAt: Date,
  managerActionDate?: Date,
  appointmentDate?: Date
): TimelineStage[] {
  const stages: TimelineStage[] = [
    {
      id: 'submitted',
      label: 'Submitted',
      status: 'completed',
      description: 'Warranty claim submitted',
      timestamp: createdAt
    },
    {
      id: 'under_review',
      label: 'Under Review',
      status: getStageStatus(currentStatus, TicketStatus.VALIDATED),
      description: 'Automated validation in progress'
    },
    {
      id: 'manager_review',
      label: 'Manager Review',
      status: getStageStatus(currentStatus, TicketStatus.MANAGER_REVIEW),
      description: 'Awaiting manager approval'
    },
    {
      id: 'approved',
      label: 'Approved',
      status: getStageStatus(currentStatus, TicketStatus.APPROVED),
      description: 'Claim approved, scheduling service',
      timestamp: managerActionDate
    },
    {
      id: 'scheduled',
      label: 'Service Scheduled',
      status: getStageStatus(currentStatus, TicketStatus.SCHEDULED),
      description: 'Service appointment confirmed',
      timestamp: appointmentDate
    }
  ];

  // Handle rejection case
  if (currentStatus === TicketStatus.REJECTED) {
    const rejectedStageIndex = stages.findIndex(stage => stage.id === 'manager_review');
    if (rejectedStageIndex !== -1) {
      stages[rejectedStageIndex].status = 'rejected';
      stages[rejectedStageIndex].description = 'Claim rejected by manager';
      stages[rejectedStageIndex].timestamp = managerActionDate;
      
      // Mark subsequent stages as pending
      for (let i = rejectedStageIndex + 1; i < stages.length; i++) {
        stages[i].status = 'pending';
      }
    }
  }

  return stages;
}

/**
 * Determines the status of a timeline stage based on current ticket status
 */
function getStageStatus(
  currentStatus: TicketStatus, 
  stageStatus: TicketStatus
): 'completed' | 'current' | 'pending' | 'rejected' {
  const statusOrder = [
    TicketStatus.PENDING,
    TicketStatus.VALIDATED,
    TicketStatus.MANAGER_REVIEW,
    TicketStatus.APPROVED,
    TicketStatus.SCHEDULED
  ];

  const currentIndex = statusOrder.indexOf(currentStatus);
  const stageIndex = statusOrder.indexOf(stageStatus);

  if (currentStatus === TicketStatus.REJECTED && stageStatus === TicketStatus.MANAGER_REVIEW) {
    return 'rejected';
  }

  if (currentIndex > stageIndex) {
    return 'completed';
  } else if (currentIndex === stageIndex) {
    return 'current';
  } else {
    return 'pending';
  }
}

// ================= ERROR HANDLING UTILITIES =================

/**
 * Creates a standardized error object
 */
export function createWarrantyTrackerError(
  type: ErrorType,
  message: string,
  details?: string,
  code?: string
): WarrantyTrackerError {
  return {
    type,
    message,
    details,
    code,
    timestamp: new Date()
  };
}

/**
 * Maps HTTP status codes to error types
 */
export function mapHttpStatusToErrorType(status: number): ErrorType {
  switch (status) {
    case 400:
      return ErrorType.VALIDATION_ERROR;
    case 401:
      return ErrorType.UNAUTHORIZED;
    case 404:
      return ErrorType.NOT_FOUND;
    case 429:
      return ErrorType.RATE_LIMITED;
    case 500:
    case 502:
    case 503:
      return ErrorType.DATABASE_ERROR;
    default:
      return ErrorType.NETWORK_ERROR;
  }
}

/**
 * Gets user-friendly error messages for different error types
 */
export function getErrorMessage(errorType: ErrorType): string {
  const errorMessages: Record<ErrorType, string> = {
    [ErrorType.INVALID_TRACKING_CODE]: 'The tracking code you entered is invalid or has expired.',
    [ErrorType.NETWORK_ERROR]: 'Unable to connect to our servers. Please check your internet connection and try again.',
    [ErrorType.DATABASE_ERROR]: 'We\'re experiencing technical difficulties. Please try again in a few minutes.',
    [ErrorType.VALIDATION_ERROR]: 'The information provided is invalid. Please check your input and try again.',
    [ErrorType.UNAUTHORIZED]: 'You don\'t have permission to access this ticket.',
    [ErrorType.NOT_FOUND]: 'The ticket you\'re looking for could not be found.',
    [ErrorType.RATE_LIMITED]: 'Too many requests. Please wait a moment before trying again.'
  };

  return errorMessages[errorType] || 'An unexpected error occurred. Please try again.';
}

// ================= VALIDATION UTILITIES =================

/**
 * Validates tracking code format (UUID)
 */
export function isValidTrackingCode(trackingCode: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(trackingCode);
}

/**
 * Validates ticket status
 */
export function isValidTicketStatus(status: string): status is TicketStatus {
  return Object.values(TicketStatus).includes(status as TicketStatus);
}

// ================= FORMATTING UTILITIES =================

/**
 * Formats a date for display in the UI
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Formats a date for relative display (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return formatDate(dateObj);
  }
}

/**
 * Masks sensitive information for display
 */
export function maskSensitiveData(data: string, visibleChars: number = 3): string {
  if (data.length <= visibleChars * 2) {
    return data;
  }
  
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const masked = '*'.repeat(Math.max(3, data.length - (visibleChars * 2)));
  
  return `${start}${masked}${end}`;
}

/**
 * Calculates countdown to a future date
 */
export function calculateCountdown(targetDate: Date | string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  const targetDateObj = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  const diffInMs = targetDateObj.getTime() - now.getTime();
  
  if (diffInMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, isExpired: false };
}

// ================= POLLING UTILITIES =================

/**
 * Default polling configuration
 */
export const DEFAULT_POLLING_CONFIG = {
  interval: 30000, // 30 seconds
  maxRetries: 3,
  backoffMultiplier: 2,
  enabled: true
};

/**
 * Calculates next polling interval with exponential backoff
 */
export function calculateBackoffInterval(
  baseInterval: number,
  retryCount: number,
  multiplier: number = 2
): number {
  return Math.min(baseInterval * Math.pow(multiplier, retryCount), 300000); // Max 5 minutes
}