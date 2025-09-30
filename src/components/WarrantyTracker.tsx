'use client';

import React, { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  WarrantyTrackerProps, 
  WarrantyTrackerState, 
  WarrantyTrackerAction, 
  ActionType,
  TicketData,
  ErrorType,
  WarrantyTrackerError,
  LoadingState,
  TicketStatus,
} from '@/lib/types/warranty-tracker';
import { 
  createWarrantyTrackerError, 
  getErrorMessage, 
  isValidTrackingCode,
  DEFAULT_POLLING_CONFIG,
  calculateBackoffInterval,
  STATUS_CONFIG
} from '@/lib/utils/warranty-tracker';
// Removed direct database import - using API calls instead
import { StatusBadge } from './StatusBadge';
import { ProgressTimeline } from './ProgressTimeline';
import { TicketDetails } from './TicketDetails';
import { AppointmentInfo } from './AppointmentInfo';
import { RefreshCw, AlertCircle, Wifi, WifiOff, Bell, BellOff, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ================= STATE MANAGEMENT =================

/**
 * Initial state for the warranty tracker
 */
const initialState: WarrantyTrackerState = {
  ticket: undefined,
  loading: { isLoading: false },
  error: undefined,
  lastUpdated: undefined,
  pollingEnabled: DEFAULT_POLLING_CONFIG.enabled
};

// ================= NOTIFICATION TYPES =================

interface StatusChangeNotification {
  id: string;
  ticketId: number;
  oldStatus: TicketStatus;
  newStatus: TicketStatus;
  timestamp: Date;
  message: string;
  read: boolean;
}

interface NotificationState {
  notifications: StatusChangeNotification[];
  unreadCount: number;
  notificationsEnabled: boolean;
}

/**
 * State reducer for managing warranty tracker state
 */
function warrantyTrackerReducer(
  state: WarrantyTrackerState, 
  action: WarrantyTrackerAction
): WarrantyTrackerState {
  switch (action.type) {
    case ActionType.SET_LOADING:
      return {
        ...state,
        loading: action.payload as LoadingState,
        error: undefined
      };
    
    case ActionType.SET_TICKET_DATA:
      return {
        ...state,
        ticket: action.payload as TicketData,
        loading: { isLoading: false },
        error: undefined,
        lastUpdated: new Date()
      };
    
    case ActionType.SET_ERROR:
      return {
        ...state,
        loading: { isLoading: false },
        error: action.payload as WarrantyTrackerError
      };
    
    case ActionType.CLEAR_ERROR:
      return {
        ...state,
        error: undefined
      };
    
    case ActionType.UPDATE_STATUS:
      if (!state.ticket) return state;
      return {
        ...state,
        ticket: {
          ...state.ticket,
          status: action.payload.status
        },
        lastUpdated: new Date()
      };
    
    case ActionType.TOGGLE_POLLING:
      return {
        ...state,
        pollingEnabled: action.payload ?? !state.pollingEnabled
      };
    
    case ActionType.SET_LAST_UPDATED:
      return {
        ...state,
        lastUpdated: action.payload as Date
      };
    
    default:
      return state;
  }
}

// ================= ERROR BOUNDARY COMPONENT =================

interface ErrorFallbackProps {
  error: WarrantyTrackerError;
  onRetry: () => void;
}

function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          Unable to Load Ticket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            {getErrorMessage(error.type)}
          </AlertDescription>
        </Alert>
        
        {error.details && (
          <div className="text-sm text-muted-foreground">
            <strong>Details:</strong> {error.details}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ================= LOADING SKELETON COMPONENT =================

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-48 animate-pulse" />
            <div className="h-6 bg-muted rounded w-24 animate-pulse" />
          </div>
        </CardHeader>
      </Card>
      
      {/* Timeline skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between space-x-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
                <div className="h-4 bg-muted rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Details skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              <div className="h-6 bg-muted rounded w-full animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ================= MAIN COMPONENT =================

/**
 * Main WarrantyTracker component
 */
export function WarrantyTracker({ 
  trackingCode, 
  className,
  initialData 
}: WarrantyTrackerProps) {
  const [state, dispatch] = useReducer(warrantyTrackerReducer, {
    ...initialState,
    ticket: initialData
  });
  
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [notifications, setNotifications] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    notificationsEnabled: true
  });
  
  // Refs for cleanup
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const previousStatusRef = useRef<TicketStatus | undefined>(initialData?.status);

  // ================= NOTIFICATION SYSTEM =================

  /**
   * Creates a status change notification
   */
  const createStatusChangeNotification = useCallback((
    ticketId: number,
    oldStatus: TicketStatus,
    newStatus: TicketStatus
  ): StatusChangeNotification => {
    const statusConfig = STATUS_CONFIG[newStatus];
    const message = `Your warranty ticket status changed from "${STATUS_CONFIG[oldStatus].label}" to "${statusConfig.label}"`;
    
    return {
      id: `${ticketId}-${Date.now()}`,
      ticketId,
      oldStatus,
      newStatus,
      timestamp: new Date(),
      message,
      read: false
    };
  }, []);

  /**
   * Adds a new notification
   */
  const addNotification = useCallback((notification: StatusChangeNotification) => {
    setNotifications(prev => ({
      ...prev,
      notifications: [notification, ...prev.notifications.slice(0, 9)], // Keep last 10
      unreadCount: prev.unreadCount + 1
    }));

    // Show browser notification if enabled and permission granted
    if (notifications.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Warranty Ticket Update', {
        body: notification.message,
        icon: '/favicon.ico',
        tag: `ticket-${notification.ticketId}`
      });
    }
  }, [notifications.notificationsEnabled]);

  /**
   * Marks all notifications as read
   */
  const markNotificationsAsRead = useCallback(() => {
    setNotifications(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }));
  }, []);

  /**
   * Toggles notification preferences
   */
  const toggleNotifications = useCallback(async () => {
    if (!notifications.notificationsEnabled) {
      // Request permission when enabling
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          return; // Don't enable if permission denied
        }
      }
    }
    
    setNotifications(prev => ({
      ...prev,
      notificationsEnabled: !prev.notificationsEnabled
    }));
  }, [notifications.notificationsEnabled]);

  // ================= DATA FETCHING =================

  /**
   * Fetches ticket data from the API with optimistic updates
   */
  const fetchTicketData = useCallback(async (showLoading = true, isPolling = false) => {
    // Validate tracking code
    if (!isValidTrackingCode(trackingCode)) {
      dispatch({
        type: ActionType.SET_ERROR,
        payload: createWarrantyTrackerError(
          ErrorType.INVALID_TRACKING_CODE,
          'Invalid tracking code format',
          'The tracking code must be a valid UUID format'
        )
      });
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    if (showLoading) {
      dispatch({
        type: ActionType.SET_LOADING,
        payload: { isLoading: true, operation: isPolling ? 'Checking for updates...' : 'Fetching ticket data...' }
      });
    }

    try {
      // Use API route instead of direct database call
      const response = await fetch(`/api/track/${trackingCode}`, {
        signal: abortControllerRef.current?.signal
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ticket not found');
        }
        throw new Error(`Failed to fetch ticket: ${response.statusText}`);
      }
      
      const result = await response.json();
      const ticketData = result.data;
      
      // Check for status changes (optimistic updates)
      const previousStatus = previousStatusRef.current;
      if (previousStatus && previousStatus !== ticketData.status) {
        // Create notification for status change
        const notification = createStatusChangeNotification(
          ticketData.id,
          previousStatus,
          ticketData.status
        );
        addNotification(notification);
      }
      
      // Update previous status reference
      previousStatusRef.current = ticketData.status;
      
      dispatch({
        type: ActionType.SET_TICKET_DATA,
        payload: ticketData
      });
      
      dispatch({
        type: ActionType.SET_LAST_UPDATED,
        payload: new Date()
      });
      
      setRetryCount(0); // Reset retry count on success
      abortControllerRef.current = null;
    } catch (error) {
      // Don't show errors for aborted requests
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      console.error('Error fetching ticket data:', error);
      
      let errorType: ErrorType;
      let errorMessage: string;
      let errorDetails: string | undefined;

      if (error instanceof Error) {
        if (error.message.includes('Ticket not found')) {
          errorType = ErrorType.NOT_FOUND;
          errorMessage = 'Ticket not found';
          errorDetails = 'No ticket exists with this tracking code';
        } else if (error.message.includes('Invalid tracking code')) {
          errorType = ErrorType.INVALID_TRACKING_CODE;
          errorMessage = 'Invalid tracking code';
          errorDetails = error.message;
        } else if (error.message.includes('Failed to fetch')) {
          errorType = ErrorType.NETWORK_ERROR;
          errorMessage = 'Network connection error';
          errorDetails = 'Unable to connect to the server';
        } else {
          errorType = ErrorType.DATABASE_ERROR;
          errorMessage = error.message;
          errorDetails = 'Server error occurred';
        }
      } else {
        errorType = ErrorType.NETWORK_ERROR;
        errorMessage = 'Network connection error';
        errorDetails = 'Unable to connect to the server';
      }

      dispatch({
        type: ActionType.SET_ERROR,
        payload: createWarrantyTrackerError(errorType, errorMessage, errorDetails)
      });
      
      abortControllerRef.current = null;
    }
  }, [trackingCode, createStatusChangeNotification, addNotification]);

  /**
   * Handles retry with exponential backoff
   */
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    dispatch({ type: ActionType.CLEAR_ERROR });
    
    // Add delay for retries with exponential backoff
    const delay = calculateBackoffInterval(1000, retryCount);
    setTimeout(() => {
      fetchTicketData();
    }, delay);
  }, [fetchTicketData, retryCount]);

  // ================= POLLING LOGIC =================

  /**
   * Enhanced polling effect for real-time updates with proper cleanup
   */
  useEffect(() => {
    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Don't start polling if conditions aren't met
    if (!state.pollingEnabled || !state.ticket || state.error || !isOnline) {
      return;
    }

    // Start new polling interval
    pollingIntervalRef.current = setInterval(() => {
      if (isOnline && state.pollingEnabled) {
        fetchTicketData(false, true); // Don't show loading, mark as polling
      }
    }, DEFAULT_POLLING_CONFIG.interval);

    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [state.pollingEnabled, state.ticket, state.error, isOnline, fetchTicketData]);

  /**
   * Cleanup effect for component unmount
   */
  useEffect(() => {
    return () => {
      // Clear polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ================= NETWORK STATUS =================

  /**
   * Network status monitoring
   */
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ================= INITIAL DATA FETCH =================

  /**
   * Initial data fetch on mount (if no initial data provided)
   */
  useEffect(() => {
    if (!initialData) {
      fetchTicketData();
    } else {
      // Set initial status reference
      previousStatusRef.current = initialData.status;
    }
  }, [initialData, fetchTicketData]);

  // ================= RENDER HELPERS =================

  /**
   * Renders the notification panel
   */
  const renderNotificationPanel = () => (
    <div className="space-y-2">
      {notifications.notifications.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4">
          No notifications yet
        </div>
      ) : (
        notifications.notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "p-3 rounded-lg border text-sm",
              notification.read 
                ? "bg-muted/50 border-muted" 
                : "bg-primary/5 border-primary/20"
            )}
          >
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.timestamp.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  /**
   * Renders the header with status and controls
   */
  const renderHeader = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            Warranty Ticket Tracker
            {state.ticket && (
              <StatusBadge status={state.ticket.status} size="sm" />
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Notification controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleNotifications}
                className="relative"
              >
                {notifications.notificationsEnabled ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
                {notifications.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}
                  </span>
                )}
              </Button>
              
              {notifications.unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markNotificationsAsRead}
                  className="text-xs"
                >
                  Mark read
                </Button>
              )}
            </div>
            
            {/* Network status indicator */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isOnline ? (
                <Wifi className="w-3 h-3 text-green-500" />
              ) : (
                <WifiOff className="w-3 h-3 text-red-500" />
              )}
              {isOnline ? 'Online' : 'Offline'}
            </div>
            
            {/* Polling status indicator */}
            {state.pollingEnabled && state.ticket && !state.error && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </div>
            )}
            
            {/* Manual refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchTicketData()}
              disabled={state.loading.isLoading}
            >
              <RefreshCw className={cn(
                "w-4 h-4",
                state.loading.isLoading && "animate-spin"
              )} />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {state.lastUpdated && (
              <div className="text-xs text-muted-foreground">
                Last updated: {state.lastUpdated.toLocaleTimeString()}
              </div>
            )}
            
            {state.loading.isLoading && state.loading.operation && (
              <div className="text-xs text-muted-foreground">
                {state.loading.operation}
              </div>
            )}
          </div>
          
          {state.pollingEnabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: ActionType.TOGGLE_POLLING, payload: false })}
              className="text-xs"
            >
              Disable auto-refresh
            </Button>
          )}
        </div>
        
        {/* Notification panel */}
        {notifications.notifications.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Recent Updates</h4>
              {notifications.notifications.length > 3 && (
                <Button variant="ghost" size="sm" className="text-xs">
                  View all
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {renderNotificationPanel()}
            </div>
          </div>
        )}
      </CardHeader>
    </Card>
  );

  // ================= MAIN RENDER =================

  return (
    <div className={cn("space-y-6 max-w-4xl mx-auto", className)}>
      {renderHeader()}
      
      {/* Error State */}
      {state.error && (
        <ErrorFallback error={state.error} onRetry={handleRetry} />
      )}
      
      {/* Loading State */}
      {state.loading.isLoading && !state.ticket && (
        <LoadingSkeleton />
      )}
      
      {/* Success State - Show ticket data */}
      {state.ticket && !state.error && (
        <>
          {/* Progress Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressTimeline
                currentStatus={state.ticket.status}
                createdAt={state.ticket.createdAt}
                managerAction={state.ticket.managerAction}
              />
            </CardContent>
          </Card>
          
          {/* Ticket Details */}
          <TicketDetails ticket={state.ticket} />
          
          {/* Appointment Info (conditional) */}
          {state.ticket.appointment && (
            <AppointmentInfo appointment={state.ticket.appointment} />
          )}
        </>
      )}
      
      {/* Offline Notice */}
      {!isOnline && (
        <Alert>
          <WifiOff className="w-4 h-4" />
          <AlertDescription>
            You&apos;re currently offline. The tracker will update automatically when your connection is restored.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default WarrantyTracker;