import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppointmentInfoProps } from '@/lib/types/warranty-tracker';
import { formatDate, calculateCountdown } from '@/lib/utils/warranty-tracker';
import { Calendar, Clock, MapPin, Phone, Mail, Timer } from 'lucide-react';

export function AppointmentInfo({ 
  appointment, 
  className = '', 
  showCountdown = true 
}: AppointmentInfoProps) {
  const [countdown, setCountdown] = useState(calculateCountdown(appointment.appointmentDate));

  // Update countdown every second
  useEffect(() => {
    if (!showCountdown) return;

    const interval = setInterval(() => {
      setCountdown(calculateCountdown(appointment.appointmentDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [appointment.appointmentDate, showCountdown]);

  // Mock service center details - in real implementation, this would come from the appointment data
  const serviceCenterDetails = {
    name: appointment.serviceCenter,
    address: '123 Service Center Ave, Tech District, City 12345',
    phone: '+1 (555) 123-4567',
    email: 'service@techcenter.com',
    hours: 'Mon-Fri: 9:00 AM - 6:00 PM, Sat: 10:00 AM - 4:00 PM'
  };

  const formatCountdownText = () => {
    if (countdown.isExpired) {
      return 'Appointment time has passed';
    }

    const parts = [];
    if (countdown.days > 0) parts.push(`${countdown.days}d`);
    if (countdown.hours > 0) parts.push(`${countdown.hours}h`);
    if (countdown.minutes > 0) parts.push(`${countdown.minutes}m`);
    if (countdown.seconds > 0 && countdown.days === 0) parts.push(`${countdown.seconds}s`);

    return parts.length > 0 ? parts.join(' ') : 'Less than a minute';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Service Appointment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Appointment Date & Time */}
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
          <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Calendar className="w-4 h-4" />
                Appointment Scheduled
              </div>
              <div className="text-lg font-semibold">
                {formatDate(appointment.appointmentDate)}
              </div>
            </div>
            
            {/* Countdown Timer */}
            {showCountdown && (
              <div className="bg-background border rounded-lg p-3 min-w-fit">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                  <Timer className="w-4 h-4" />
                  {countdown.isExpired ? 'Status' : 'Time Remaining'}
                </div>
                <div className={`font-mono text-sm font-semibold ${
                  countdown.isExpired ? 'text-muted-foreground' : 'text-primary'
                }`}>
                  {formatCountdownText()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Service Center Information */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Service Center Details
          </h4>
          
          <div className="bg-muted/50 p-4 rounded-lg space-y-4">
            {/* Service Center Name */}
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Service Center</div>
              <div className="font-semibold text-lg">{serviceCenterDetails.name}</div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Location</div>
                <div className="text-sm leading-relaxed">{serviceCenterDetails.address}</div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Phone</div>
                  <div className="text-sm font-mono">{serviceCenterDetails.phone}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Email</div>
                  <div className="text-sm font-mono">{serviceCenterDetails.email}</div>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Operating Hours</div>
                <div className="text-sm">{serviceCenterDetails.hours}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="text-sm font-medium text-yellow-800 mb-2">Important Notes</div>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Please bring a valid ID and your original purchase receipt</li>
            <li>• Arrive 15 minutes early for check-in</li>
            <li>• If you need to reschedule, please call at least 24 hours in advance</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}