import { eq } from "drizzle-orm";
import { db } from "@/db/schema";
import { tickets, users, products, purchases, managerActions, serviceAppointments } from "@/db/schema";

export interface TicketData {
  id: number;
  trackingCode: string;
  status: string;
  createdAt: Date;
  description: string | null;
  issueType: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  product: {
    id: number;
    name: string;
    brand: string | null;
    model: string | null;
    warrantyMonths: number | null;
  };
  purchase: {
    id: number;
    invoiceNumber: string;
    purchaseDate: Date;
    invoiceFileUrl: string | null;
  };
  managerAction?: {
    id: number;
    approved: boolean;
    remarks: string | null;
    actionDate: Date;
  };
  appointment?: {
    id: number;
    serviceCenter: string | null;
    appointmentDate: Date;
  };
}

export class TicketQueryError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TicketQueryError';
  }
}

/**
 * Validates tracking code format (UUID)
 */
function validateTrackingCode(trackingCode: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(trackingCode);
}

/**
 * Fetches complete ticket data by tracking code with all related information
 * @param trackingCode - UUID tracking code for the ticket
 * @returns Promise<TicketData> - Complete ticket information
 * @throws TicketQueryError - When ticket not found or invalid tracking code
 */
export async function getTicketByTrackingCode(trackingCode: string): Promise<TicketData> {
  // Validate tracking code format
  if (!trackingCode || typeof trackingCode !== 'string') {
    throw new TicketQueryError('Tracking code is required', 'INVALID_INPUT');
  }

  if (!validateTrackingCode(trackingCode)) {
    throw new TicketQueryError('Invalid tracking code format', 'INVALID_FORMAT');
  }

  try {
    // Query with joins across all related tables
    const result = await db
      .select({
        // Ticket fields
        ticketId: tickets.id,
        trackingCode: tickets.trackingCode,
        status: tickets.status,
        createdAt: tickets.createdAt,
        description: tickets.description,
        issueType: tickets.issueType,
        
        // User fields
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
        
        // Product fields
        productId: products.id,
        productName: products.name,
        productBrand: products.brand,
        productModel: products.model,
        warrantyMonths: products.warrantyMonths,
        
        // Purchase fields
        purchaseId: purchases.id,
        invoiceNumber: purchases.invoiceNumber,
        purchaseDate: purchases.purchaseDate,
        invoiceFileUrl: purchases.invoiceFileUrl,
        
        // Manager action fields (optional)
        managerApproved: managerActions.approved,
        managerRemarks: managerActions.remarks,
        managerActionDate: managerActions.actionDate,
        
        // Service appointment fields (optional)
        serviceCenter: serviceAppointments.serviceCenter,
        appointmentDate: serviceAppointments.appointmentDate,
      })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .innerJoin(purchases, eq(tickets.purchaseId, purchases.id))
      .innerJoin(products, eq(purchases.productId, products.id))
      .leftJoin(managerActions, eq(tickets.id, managerActions.ticketId))
      .leftJoin(serviceAppointments, eq(tickets.id, serviceAppointments.ticketId))
      .where(eq(tickets.trackingCode, trackingCode))
      .limit(1);

    if (result.length === 0) {
      throw new TicketQueryError('Ticket not found', 'NOT_FOUND');
    }

    const row = result[0];

    // Transform the flat result into structured data
    const ticketData: TicketData = {
      id: row.ticketId,
      trackingCode: row.trackingCode,
      status: row.status || 'pending',
      createdAt: row.createdAt,
      description: row.description,
      issueType: row.issueType,
      user: {
        id: row.userId,
        name: row.userName,
        email: row.userEmail,
        phone: row.userPhone,
      },
      product: {
        id: row.productId,
        name: row.productName,
        brand: row.productBrand,
        model: row.productModel,
        warrantyMonths: row.warrantyMonths,
      },
      purchase: {
        id: row.purchaseId,
        invoiceNumber: row.invoiceNumber,
        purchaseDate: row.purchaseDate,
        invoiceFileUrl: row.invoiceFileUrl,
      },
    };

    // Add optional manager action if exists
    if (row.managerApproved !== null && row.managerActionDate) {
      ticketData.managerAction = {
        id: row.ticketId, // Use ticket ID as manager action ID for now
        approved: row.managerApproved,
        remarks: row.managerRemarks,
        actionDate: row.managerActionDate,
      };
    }

    // Add optional appointment if exists
    if (row.appointmentDate) {
      ticketData.appointment = {
        id: row.ticketId, // Use ticket ID as appointment ID for now
        serviceCenter: row.serviceCenter,
        appointmentDate: row.appointmentDate,
      };
    }

    return ticketData;
  } catch (error) {
    if (error instanceof TicketQueryError) {
      throw error;
    }
    
    // Log the actual error for debugging but don't expose internal details
    console.error('Database error in getTicketByTrackingCode:', error);
    throw new TicketQueryError('Failed to fetch ticket data', 'DATABASE_ERROR');
  }
}

/**
 * Checks if a tracking code exists in the database
 * @param trackingCode - UUID tracking code to check
 * @returns Promise<boolean> - True if tracking code exists
 */
export async function trackingCodeExists(trackingCode: string): Promise<boolean> {
  if (!trackingCode || !validateTrackingCode(trackingCode)) {
    return false;
  }

  try {
    const result = await db
      .select({ id: tickets.id })
      .from(tickets)
      .where(eq(tickets.trackingCode, trackingCode))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error('Database error in trackingCodeExists:', error);
    return false;
  }
}

/**
 * Gets basic ticket status by tracking code (lightweight query)
 * @param trackingCode - UUID tracking code
 * @returns Promise<{status: string, id: number} | null>
 */
export async function getTicketStatus(trackingCode: string): Promise<{status: string, id: number} | null> {
  if (!trackingCode || !validateTrackingCode(trackingCode)) {
    return null;
  }

  try {
    const result = await db
      .select({
        id: tickets.id,
        status: tickets.status,
      })
      .from(tickets)
      .where(eq(tickets.trackingCode, trackingCode))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return {
      id: result[0].id,
      status: result[0].status || 'pending',
    };
  } catch (error) {
    console.error('Database error in getTicketStatus:', error);
    return null;
  }
}