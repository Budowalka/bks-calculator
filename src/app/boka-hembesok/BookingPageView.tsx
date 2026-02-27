'use client';

import { useEffect } from 'react';
import { trackBookingPageView } from '@/lib/analytics';

export function BookingPageView() {
  useEffect(() => {
    trackBookingPageView();
  }, []);
  return null;
}
