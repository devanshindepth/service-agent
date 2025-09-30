import { notFound } from 'next/navigation';
import { WarrantyTracker } from '@/components/WarrantyTracker';
import { getTicketByTrackingCode, TicketQueryError } from '@/lib/ticket-queries';
import { TicketData, TicketStatus } from '@/lib/types/warranty-tracker';

interface PageProps {
  params: {
    trackingCode: string;
  };
}

/**
 * Server-side data fetching for initial page load
 */
async function getTicketData(trackingCode: string): Promise<TicketData | null> {
  try {
    const ticket = await getTicketByTrackingCode(trackingCode);
    return {
      ...ticket,
      status: ticket.status as TicketStatus,
      description: ticket.description ?? undefined,
      appointment: ticket.appointment ? {
        id: ticket.appointment.id,
        serviceCenter: ticket.appointment.serviceCenter ?? '',
        appointmentDate: ticket.appointment.appointmentDate
      } : undefined,
      managerAction: ticket.managerAction ? {
        ...ticket.managerAction,
        id: ticket.managerAction.id,
        remarks: ticket.managerAction.remarks ?? undefined
      } : undefined,
      product: {
        ...ticket.product,
        brand: ticket.product.brand ?? 'Unknown',
        model: ticket.product.model ?? 'Unknown',
        warrantyMonths: ticket.product.warrantyMonths ?? 0
      },
      user: {
        ...ticket.user,
        phone: ticket.user.phone ?? undefined
      },
      purchase: {
        ...ticket.purchase,
        invoiceFileUrl: ticket.purchase.invoiceFileUrl ?? undefined
      }
    };
  } catch (error) {
    if (error instanceof TicketQueryError) {
      // Log the error but don't expose details to client
      console.error(`Ticket query error for ${trackingCode}:`, error.message);
      
      // Return null for not found or invalid format errors
      if (error.code === 'NOT_FOUND' || error.code === 'INVALID_FORMAT') {
        return null;
      }
    }
    
    // For other errors, log and return null to show error state
    console.error(`Unexpected error fetching ticket ${trackingCode}:`, error);
    return null;
  }
}

/**
 * Main tracking page component
 */
export default async function TrackingPage({ params }: PageProps) {
  const { trackingCode } = await params;
  
  // Validate tracking code format on server
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(trackingCode)) {
    notFound();
  }
  
  // Fetch initial ticket data on server
  const initialTicketData = await getTicketData(trackingCode);
  
  // If ticket not found, show 404
  if (!initialTicketData) {
    notFound();
  }
  
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <WarrantyTracker 
          trackingCode={trackingCode}
          initialData={initialTicketData}
          className="max-w-4xl mx-auto"
        />
      </div>
    </main>
  );
}