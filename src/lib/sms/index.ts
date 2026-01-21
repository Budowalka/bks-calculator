/**
 * SMS Module - 46elks Integration for BKS Calculator
 *
 * @example
 * ```typescript
 * import { sendQuoteConfirmationSMS } from '@/lib/sms';
 *
 * await sendQuoteConfirmationSMS({
 *   customerPhone: '0701234567',
 *   customerEmail: 'kund@example.com',
 *   calLink: 'https://cal.com/bks/x'
 * });
 * ```
 */

// Main service function
export { sendQuoteConfirmationSMS } from './sms-service';

// Low-level client (for advanced usage)
export { sendSMS } from './46elks-client';

// Phone utilities
export { formatSwedishPhone, isValidSwedishMobile } from './phone-formatter';

// Types
export type { SendSMSParams, SMSResponse } from './46elks-client';
export type { QuoteSMSParams, SMSResult } from './sms-service';
