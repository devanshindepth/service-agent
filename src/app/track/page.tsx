import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TrackingCodeData {
  trackingCode: string;
  status: string;
  createdAt: string;
  issueType: string;
}

async function getTrackingCodes(): Promise<TrackingCodeData[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/track`, {
      cache: 'no-store' // Always fetch fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch tracking codes');
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching tracking codes:', error);
    return [];
  }
}

export default async function TrackPage() {
  const trackingCodes = await getTrackingCodes();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Warranty Ticket Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Enter Tracking Code</h3>
                <p className="text-muted-foreground mb-4">
                  Enter your warranty ticket tracking code in the URL like: 
                  <code className="bg-muted px-2 py-1 rounded ml-2">
                    /track/your-tracking-code
                  </code>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Available Tracking Codes</h3>
                <p className="text-muted-foreground mb-4">
                  Click on these tracking codes to view warranty ticket details:
                </p>
                {trackingCodes.length > 0 ? (
                  <div className="space-y-3">
                    {trackingCodes.map((ticket, index) => (
                      <div key={ticket.trackingCode} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/track/${ticket.trackingCode}`}>
                            Ticket #{index + 1}
                          </Link>
                        </Button>
                        <div className="flex-1">
                          <code className="text-sm text-muted-foreground block">{ticket.trackingCode}</code>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {ticket.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {ticket.issueType.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No tracking codes found in the database.</p>
                    <p className="text-sm mt-2">Run the seed script to populate test data.</p>
                  </div>
                )}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">How to use:</h4>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Click on one of the sample links above</li>
                  <li>2. Or manually navigate to <code>/track/your-tracking-code</code></li>
                  <li>3. The tracking page will show warranty ticket details</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}