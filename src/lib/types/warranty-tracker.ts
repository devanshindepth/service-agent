/**
 * Core TypeScript interfaces and types for the Warranty Ticket Tracker
 * 
 * This file defines all the essential types used throughout the warranty tracking system,
 * including ticket data structures, status enums, API responses, and component props.
 */

// ================= ENUMS =================

/**
 * Enum representing the various states a warranty ticket can be in
 */
export enum TicketStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  MANAGER_REVIEW = 'manager_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SCHEDULED = 'scheduled'
}

// ================= CORE DATA INTERFACES =================

/**
 * User information interface
 */
export interface UserData {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

/**
 * Product information interface
 */
export interface ProductData {
  id: number;
  name: string;
  brand: string;
  model: string;
  warrantyMonths: number;
}

/**
 * Purchase information interface
 */
export interface PurchaseData {
  id: number;
  invoiceNumber: string;
  invoiceFileUrl?: string;
  purchaseDate: Date;
}

/**
 * Manager action details interface
 */
export interface ManagerActionData {
  id: number;
  approved: boolean;
  remarks?: string;
  actionDate: Date;
}

/**
 * Service appointment details interface
 */
export interface ServiceAppointmentData {
  id: number;
  serviceCenter: string;
  appointmentDate: Date;
}

/**
 * Main ticket data interface containing all related information
 */
export interface TicketData {
  id: number;
  trackingCode: string;
  status: TicketStatus;
  issueType: string;
  description?: string;
  createdAt: Date;
  user: UserData;
  product: ProductData;
  purchase: PurchaseData;
  managerAction?: ManagerActionData;
  appointment?: ServiceAppointmentData;
}

// ================= API RESPONSE INTERFACES =================

/**
 * Standard API response wrapper for ticket operations
 */
export interface TicketResponse {
  success: boolean;
  data?: TicketData;
  error?: string;
  message?: string;
}

/**
 * Status update notification interface
 */
export interface StatusUpdate {
  ticketId: number;
  newStatus: TicketStatus;
  timestamp: Date;
  details?: string;
}

/**
 * API response for status updates
 */
export interface StatusUpdateResponse {
  success: boolean;
  data?: StatusUpdate;
  error?: string;
}

// ================= COMPONENT PROP INTERFACES =================

/**
 * Props for the main WarrantyTracker component
 */
export interface WarrantyTrackerProps {
  trackingCode: string;
  className?: string;
  initialData?: TicketData;
}

/**
 * Props for the ProgressTimeline component
 */
export interface ProgressTimelineProps {
  currentStatus: TicketStatus;
  createdAt: Date;
  managerAction?: ManagerActionData;
  className?: string;
}

/**
 * Props for the StatusBadge component
 */
export interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Props for the TicketDetails component
 */
export interface TicketDetailsProps {
  ticket: TicketData;
  className?: string;
  showSensitiveData?: boolean;
}

/**
 * Props for the AppointmentInfo component
 */
export interface AppointmentInfoProps {
  appointment: ServiceAppointmentData;
  className?: string;
  showCountdown?: boolean;
}

// ================= ERROR HANDLING INTERFACES =================

/**
 * Error types that can occur in the warranty tracking system
 */
export enum ErrorType {
  INVALID_TRACKING_CODE = 'invalid_tracking_code',
  NETWORK_ERROR = 'network_error',
  DATABASE_ERROR = 'database_error',
  VALIDATION_ERROR = 'validation_error',
  UNAUTHORIZED = 'unauthorized',
  NOT_FOUND = 'not_found',
  RATE_LIMITED = 'rate_limited'
}

/**
 * Structured error interface for consistent error handling
 */
export interface WarrantyTrackerError {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string;
  timestamp: Date;
}

/**
 * Props for error boundary components
 */
export interface ErrorBoundaryProps {
  fallback: React.ComponentType<{ error: WarrantyTrackerError }>;
  children: React.ReactNode;
  onError?: (error: WarrantyTrackerError) => void;
}

/**
 * Props for error message display components
 */
export interface ErrorMessageProps {
  error: WarrantyTrackerError;
  title?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

// ================= STATE MANAGEMENT INTERFACES =================

/**
 * Loading state interface for async operations
 */
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
  progress?: number;
}

/**
 * Main state interface for the warranty tracker
 */
export interface WarrantyTrackerState {
  ticket?: TicketData;
  loading: LoadingState;
  error?: WarrantyTrackerError;
  lastUpdated?: Date;
  pollingEnabled: boolean;
}

/**
 * Action types for state management
 */
export enum ActionType {
  SET_LOADING = 'SET_LOADING',
  SET_TICKET_DATA = 'SET_TICKET_DATA',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
  UPDATE_STATUS = 'UPDATE_STATUS',
  TOGGLE_POLLING = 'TOGGLE_POLLING',
  SET_LAST_UPDATED = 'SET_LAST_UPDATED'
}

/**
 * Action interface for state updates
 */
export interface WarrantyTrackerAction {
  type: ActionType;
  payload?: any;
}

// ================= UTILITY TYPE DEFINITIONS =================

/**
 * Timeline stage information
 */
export interface TimelineStage {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending' | 'rejected';
  description?: string;
  timestamp?: Date;
}

/**
 * Status mapping configuration for UI display
 */
export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon?: string;
  description?: string;
}

/**
 * Mapping of ticket statuses to their display configurations
 */
export type StatusConfigMap = Record<TicketStatus, StatusConfig>;

/**
 * Polling configuration interface
 */
export interface PollingConfig {
  interval: number;
  maxRetries: number;
  backoffMultiplier: number;
  enabled: boolean;
}

/**
 * Notification preferences interface
 */
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}