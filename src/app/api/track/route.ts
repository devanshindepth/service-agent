import { NextResponse } from 'next/server';
import { db } from '@/db/schema';
import { tickets } from '@/db/schema-tables';

/**
 * GET /api/track - Fetch all available tracking codes
 * Returns a list of all tracking codes in the database for testing purposes
 */
export async function GET() {
  try {
    const result = await db
      .select({
        trackingCode: tickets.trackingCode,
        status: tickets.status,
        createdAt: tickets.createdAt,
        issueType: tickets.issueType
      })
      .from(tickets)
      .orderBy(tickets.createdAt);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching tracking codes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tracking codes' 
      },
      { status: 500 }
    );
  }
}