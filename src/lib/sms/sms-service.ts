/**
 * SMS Service for BKS Quote Notifications
 */

import { sendSMS } from './46elks-client';
import { formatSwedishPhone, isValidSwedishMobile } from './phone-formatter';

export interface QuoteSMSParams {
  /** Customer phone number (any Swedish format) */
  customerPhone: string;
  /** Customer email (shown in SMS) */
  customerEmail: string;
  /** Estimate ID for short link */
  estimateId: string;
}

export interface SMSResult {
  /** Whether SMS was sent successfully */
  success: boolean;
  /** 46elks SMS ID (on success) */
  smsId?: string;
  /** Cost in SEK (on success) */
  cost?: number;
  /** Number of SMS parts used */
  parts?: number;
  /** Error message (on failure) */
  error?: string;
}

/**
 * Sends SMS confirmation after quote generation
 *
 * Message template:
 * "Tack för din förfrågan! Din offert är skickad till {email}. Boka platsbesök: smova.se/b/{id}
 *
 * MVh,
 * Ramiro Botero
 * BKS AB"
 *
 * @param params - Customer details and estimate ID
 * @returns Result with success status, SMS ID, and cost
 *
 * @example
 * ```typescript
 * const result = await sendQuoteConfirmationSMS({
 *   customerPhone: '070-123 45 67',
 *   customerEmail: 'kund@example.com',
 *   estimateId: 'recABC123'
 * });
 *
 * if (result.success) {
 *   console.log(`SMS sent: ${result.smsId}, cost: ${result.cost} SEK`);
 * }
 * ```
 */
export async function sendQuoteConfirmationSMS(
  params: QuoteSMSParams
): Promise<SMSResult> {
  const { customerPhone, customerEmail, estimateId } = params;

  // Validate phone number
  if (!customerPhone || !isValidSwedishMobile(customerPhone)) {
    console.log('[SMS] Skipped: invalid Swedish mobile number', customerPhone);
    return {
      success: false,
      error: 'Invalid Swedish mobile number',
    };
  }

  // Format phone to E.164
  let formattedPhone: string;
  try {
    formattedPhone = formatSwedishPhone(customerPhone);
  } catch (err) {
    console.log('[SMS] Skipped: phone formatting failed', customerPhone, err);
    return {
      success: false,
      error: 'Phone number formatting failed',
    };
  }

  // Generate short link using smova.se domain
  const shortLink = `smova.se/b/${estimateId}`;

  // Shorten email if too long (to keep SMS compact)
  const shortEmail =
    customerEmail.length > 25
      ? customerEmail.substring(0, 22) + '...'
      : customerEmail;

  // Construct message with signature (~145 chars = 1 SMS part)
  const message = `Tack för din förfrågan! Din offert är skickad till ${shortEmail}. Boka platsbesök: ${shortLink}

MVh,
Ramiro Botero
BKS AB`;

  // Log warning if message will be split (>160 chars = 2+ parts)
  if (message.length > 160) {
    console.warn(
      `[SMS] Message length: ${message.length} chars (will use ${Math.ceil(message.length / 153)} parts)`
    );
  }

  try {
    const result = await sendSMS({
      to: formattedPhone,
      message,
    });

    const costSEK = result.cost / 10000;

    console.log('[SMS] Sent successfully:', {
      id: result.id,
      to: formattedPhone,
      cost: `${costSEK.toFixed(2)} SEK`,
      parts: result.parts,
      length: message.length,
    });

    return {
      success: true,
      smsId: result.id,
      cost: costSEK,
      parts: result.parts,
    };
  } catch (error) {
    console.error('[SMS] Failed to send:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
