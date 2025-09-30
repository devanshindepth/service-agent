import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketDetailsProps } from '@/lib/types/warranty-tracker';
import { formatDate, formatRelativeDate, maskSensitiveData } from '@/lib/utils/warranty-tracker';
import { Calendar, Package, Receipt, User } from 'lucide-react';

export function TicketDetails({ 
  ticket, 
  className = '', 
  showSensitiveData = false 
}: TicketDetailsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Ticket Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ticket Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Receipt className="w-4 h-4" />
              Ticket ID
            </div>
            <div className="font-mono text-sm bg-muted px-3 py-2 rounded-md">
              #{ticket.id.toString().padStart(6, '0')}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Created
            </div>
            <div className="text-sm">
              <div className="font-medium">{formatRelativeDate(ticket.createdAt)}</div>
              <div className="text-muted-foreground">{formatDate(ticket.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Product Information
          </h4>
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Product Name</div>
                <div className="font-medium">{ticket.product.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Brand</div>
                <div className="font-medium">{ticket.product.brand}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Model</div>
                <div className="font-medium">{ticket.product.model}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Warranty Period</div>
                <div className="font-medium">{ticket.product.warrantyMonths} months</div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Information */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Purchase Information
          </h4>
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Invoice Number</div>
                <div className="font-mono text-sm">
                  {showSensitiveData 
                    ? ticket.purchase.invoiceNumber 
                    : maskSensitiveData(ticket.purchase.invoiceNumber, 3)
                  }
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Purchase Date</div>
                <div className="font-medium">{formatDate(ticket.purchase.purchaseDate)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Customer Information
          </h4>
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <User className="w-4 h-4" />
                  Name
                </div>
                <div className="font-medium">
                  {showSensitiveData 
                    ? ticket.user.name 
                    : maskSensitiveData(ticket.user.name, 2)
                  }
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                <div className="font-mono text-sm">
                  {showSensitiveData 
                    ? ticket.user.email 
                    : maskSensitiveData(ticket.user.email, 3)
                  }
                </div>
              </div>
            </div>
            {ticket.user.phone && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Phone</div>
                <div className="font-mono text-sm">
                  {showSensitiveData 
                    ? ticket.user.phone 
                    : maskSensitiveData(ticket.user.phone, 3)
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Issue Description */}
        {ticket.description && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Issue Description
            </h4>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground mb-1">Issue Type</div>
              <div className="font-medium mb-3">{ticket.issueType}</div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
              <div className="text-sm leading-relaxed">{ticket.description}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}