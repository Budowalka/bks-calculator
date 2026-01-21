/**
 * 46elks SMS API Client
 * Documentation: https://46elks.se/docs
 */

export interface SendSMSParams {
  /** Recipient phone number in E.164 format (+46...) */
  to: string;
  /** Message content (max 160 chars for 1 part, GSM encoding) */
  message: string;
  /** Sender ID (max 11 alphanumeric chars) or phone number */
  from?: string;
  /** Test mode - doesn't send SMS, no cost */
  dryrun?: boolean;
}

export interface SMSResponse {
  /** Unique SMS ID */
  id: string;
  /** Sender (as set in request) */
  from: string;
  /** Recipient phone number */
  to: string;
  /** Message content */
  message: string;
  /** Always 'outgoing' for sent SMS */
  direction: 'outgoing';
  /** SMS status */
  status: 'created' | 'sent' | 'delivered' | 'failed';
  /** Creation timestamp (UTC) */
  created: string;
  /** Cost in 10000s of account currency (3500 = 0.35 SEK) */
  cost: number;
  /** Number of SMS parts used */
  parts: number;
}

/**
 * Sends an SMS via 46elks API
 *
 * @param params - SMS parameters
 * @returns SMS response with ID, cost, and status
 * @throws Error on API failure
 *
 * @example
 * ```typescript
 * const result = await sendSMS({
 *   to: '+46701234567',
 *   message: 'Hello from BKS!'
 * });
 * console.log(`SMS sent, cost: ${result.cost / 10000} SEK`);
 * ```
 */
export async function sendSMS(params: SendSMSParams): Promise<SMSResponse> {
  const {
    to,
    message,
    from = process.env.ELKS_SENDER_ID || 'BKS',
    dryrun = false,
  } = params;

  const username = process.env.ELKS_API_USERNAME;
  const password = process.env.ELKS_API_PASSWORD;

  if (!username || !password) {
    throw new Error('46elks API credentials not configured. Set ELKS_API_USERNAME and ELKS_API_PASSWORD environment variables.');
  }

  const credentials = Buffer.from(`${username}:${password}`).toString('base64');

  const body = new URLSearchParams({
    from,
    to,
    message,
  });

  if (dryrun) {
    body.append('dryrun', 'yes');
  }

  const response = await fetch('https://api.46elks.com/a1/sms', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();

    // Provide helpful error messages
    switch (response.status) {
      case 401:
        throw new Error('46elks API authentication failed. Check your API credentials.');
      case 402:
        throw new Error('46elks account has insufficient funds. Please top up your account.');
      case 400:
        throw new Error(`46elks API bad request: ${errorText}`);
      case 429:
        throw new Error('46elks API rate limit exceeded. Please wait and try again.');
      default:
        throw new Error(`46elks API error: ${response.status} - ${errorText}`);
    }
  }

  return response.json();
}
