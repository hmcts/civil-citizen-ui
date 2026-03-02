/**
 * Escapes HTML special characters to prevent HTML injection attacks.
 * This function converts potentially dangerous characters into their HTML entity equivalents.
 * 
 * @param text - The text to escape
 * @returns The escaped text safe for HTML rendering
 */
export function escapeHtml(text: string | undefined | null): string {
  if (!text) {
    return '';
  }
  
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
}

/**
 * Strips HTML tags from text, leaving only the text content.
 * This is a more aggressive approach than escaping.
 * 
 * @param text - The text to strip HTML from
 * @returns The text with all HTML tags removed
 */
export function stripHtml(text: string | undefined | null): string {
  if (!text) {
    return '';
  }
  
  return text.replace(/<[^>]*>/g, '');
}
