/**
 * Custom 404 page for invalid tracking codes
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchX, Home, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <SearchX className="w-16 h-16 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Tracking Code Not Found</h1>
            <p className="text-muted-foreground">
              We couldn&apos;t find a warranty ticket with this tracking code.
            </p>
          </div>

          {/* Error Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                What might have gone wrong?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Common issues:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>The tracking code was typed incorrectly</li>
                    <li>The tracking code has expired or been deactivated</li>
                    <li>The warranty ticket hasn&apos;t been created yet</li>
                    <li>There was a temporary system issue</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Tracking Code Format</h4>
                <p className="text-sm text-muted-foreground">
                  Tracking codes should look like: <code className="bg-muted px-1 rounded">12345678-1234-1234-1234-123456789abc</code>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>What can you do?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Double-check your tracking code</p>
                    <p className="text-sm text-muted-foreground">
                      Make sure you&apos;ve entered the complete tracking code exactly as provided
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Check your email or SMS</p>
                    <p className="text-sm text-muted-foreground">
                      Look for the original message containing your tracking link
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Contact support</p>
                    <p className="text-sm text-muted-foreground">
                      If you still can&apos;t find your ticket, our support team can help
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild className="flex-1">
                  <Link href="/">
                    <Home className="w-4 h-4" />
                    Go Home
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/#support">
                    <HelpCircle className="w-4 h-4" />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Help */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need immediate assistance? Contact our support team at{' '}
              <a href="mailto:support@example.com" className="text-primary hover:underline">
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}