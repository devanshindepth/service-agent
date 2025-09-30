/**
 * Loading page for warranty tracking
 * Displays while server-side rendering is in progress
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Loading */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <div className="h-6 bg-muted rounded w-48 animate-pulse" />
                </div>
                <div className="h-6 bg-muted rounded w-24 animate-pulse" />
              </div>
            </CardHeader>
          </Card>
          
          {/* Timeline Loading */}
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
          
          {/* Details Loading */}
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

          {/* Loading Message */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading your warranty ticket information...</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}