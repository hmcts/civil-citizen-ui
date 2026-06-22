/**
 * Escapes HTML special characters so the string can be safely used in HTML context.
 * Prevents HTML injection when rendering user-supplied or external data.
 */
export function escapeHtml(text: string | undefined): string {
  if (text == null || typeof text !== 'string') {
    return '';
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Wraps escaped text in a GOV.UK body paragraph.
 */
export function escapedParagraph(text: string | undefined, classes = 'govuk-body'): string {
  return `<p class="${classes}">${escapeHtml(text)}</p>`;
}

/**
 * Wraps escaped text in a list item.
 */
export function escapedListItem(text: string | undefined): string {
  return `<li>${escapeHtml(text)}</li>`;
}
