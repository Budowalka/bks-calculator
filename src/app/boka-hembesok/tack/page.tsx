import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BookingConfirmation } from './BookingConfirmation';

export const metadata: Metadata = {
  title: 'Hembesök bokat! | BKS Entreprenad Stockholm',
  description:
    'Tack för din bokning! Ditt kostnadsfria hembesök med BKS Entreprenad är bekräftat. Du får en bekräftelse via e-post.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BookingThankYouPage() {
  return (
    <Suspense>
      <BookingConfirmation />
    </Suspense>
  );
}
