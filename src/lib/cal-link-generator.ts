interface CalLinkData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

/**
 * Generates a personalized Cal.com booking link with pre-filled customer data
 * @param data Customer data for pre-filling the booking form
 * @returns Formatted Cal.com URL with query parameters
 */
export function generateCalLink(data: CalLinkData): string {
  const baseUrl = 'https://cal.com/bksentreprenad/platsbesok';
  const params = new URLSearchParams();

  // Add parameters only if they exist and are not empty
  if (data.firstName?.trim()) {
    params.append('firstName', data.firstName.trim());
  }

  if (data.lastName?.trim()) {
    params.append('lastName', data.lastName.trim());
  }

  if (data.email?.trim()) {
    params.append('email', data.email.trim());
  }

  if (data.phone?.trim()) {
    // Ensure phone number is properly formatted and encoded
    let phone = data.phone.trim();
    
    // Add + prefix if missing and phone looks like a Swedish number
    if (!phone.startsWith('+') && phone.startsWith('46')) {
      phone = '+' + phone;
    } else if (!phone.startsWith('+') && phone.startsWith('0')) {
      // Convert Swedish local format to international
      phone = '+46' + phone.substring(1);
    }
    
    params.append('phone', phone);
  }

  // Return URL with parameters if any exist, otherwise just base URL
  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
}

/**
 * Creates a Cal.com link specifically from Airtable Lead_Data format
 * @param leadData Lead data from Airtable
 * @returns Formatted Cal.com URL
 */
export function generateCalLinkFromLead(leadData: {
  'Lead First Name'?: string;
  'Lead Last Name'?: string;
  'Lead Email'?: string;
  'Lead Phone Number'?: string;
}): string {
  return generateCalLink({
    firstName: leadData['Lead First Name'],
    lastName: leadData['Lead Last Name'],
    email: leadData['Lead Email'],
    phone: leadData['Lead Phone Number']
  });
}