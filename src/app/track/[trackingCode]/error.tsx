/**
 * Error page for warranty tracking
 * Handles server-side errors during data fetching
 */

'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Tracking page error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <AlertTriangle className="w-16 h-16 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              We encountered an error while loading your warranty ticket information.
            </p>
          </div>

          {/* Error Details */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Error Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  {error.message || 'An unexpected error occurred while processing your request.'}
                </AlertDescription>
              </Alert>

              {error.digest && (
                <div className="text-sm text-muted-foreground">
                  <strong>Error ID:</strong> {error.digest}
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">What you can try:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Refresh the page to try again</li>
                  <li>Check your internet connection</li>
                  <li>Wait a few minutes and try again</li>
                  <li>Contact support if the problem persists</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={reset} className="flex-1">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/">
                    <Home className="w-4 h-4" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              If this error persists, please contact our support team at{' '}
              <a href="mailto:support@example.com" className="text-primary hover:underline">
                support@example.com
              </a>
              {error.digest && (
                <>
                  {' '}and include the error ID: <code className="bg-muted px-1 rounded">{error.digest}</code>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}