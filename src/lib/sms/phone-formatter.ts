/**
 * Phone number formatting utilities for Swedish numbers
 */

/**
 * Konwertuje szwedzki numer telefonu do formatu E.164
 *
 * Obsługiwane formaty wejściowe:
 * - 0701234567
 * - 070-123 45 67
 * - +46701234567
 * - 46701234567
 *
 * @param phone - Numer telefonu w dowolnym formacie
 * @returns Numer w formacie +46XXXXXXXXX
 * @throws Error jeśli numer jest nieprawidłowy
 */
export function formatSwedishPhone(phone: string): string {
  // Usuń wszystkie znaki oprócz cyfr
  let cleaned = phone.replace(/[^\d]/g, '');

  // Konwertuj format 07... na 467...
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '46' + cleaned.substring(1);
  }

  // Dodaj prefix 46 jeśli brakuje
  if (!cleaned.startsWith('46') && cleaned.length === 9) {
    cleaned = '46' + cleaned;
  }

  // Walidacja: szwedzki numer mobilny ma 11 cyfr (46 + 9 cyfr)
  if (cleaned.length !== 11 || !cleaned.startsWith('46')) {
    throw new Error(`Invalid Swedish phone number: ${phone}`);
  }

  return '+' + cleaned;
}

/**
 * Sprawdza czy numer telefonu wygląda na szwedzki mobilny
 * Szwedzkie numery mobilne zaczynają się od 07X
 *
 * @param phone - Numer telefonu do sprawdzenia
 * @returns true jeśli numer wygląda na prawidłowy szwedzki mobilny
 */
export function isValidSwedishMobile(phone: string): boolean {
  try {
    const formatted = formatSwedishPhone(phone);
    // Szwedzkie numery mobilne zaczynają się od +467
    return formatted.startsWith('+467');
  } catch {
    return false;
  }
}
