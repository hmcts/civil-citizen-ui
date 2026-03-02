import {ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

/**
 * Validates that the input value does not contain HTML tags or potentially dangerous characters
 * that could be used for HTML injection attacks.
 * 
 * This validator blocks:
 * - HTML tags (< and >)
 * - Script injection attempts
 * - Event handlers (on* attributes)
 * - Other potentially dangerous HTML/JavaScript patterns
 */
@ValidatorConstraint({name: 'htmlValidator', async: false})
export class HtmlValidator implements ValidatorConstraintInterface {

  // Pattern to detect HTML tags, script injection, and dangerous characters
  readonly HTML_PATTERN = /<|>|&lt;|&gt;|&#60;|&#62;|&#x3C;|&#x3E;/i;
  readonly SCRIPT_PATTERN = /<script|javascript:|onerror=|onload=|onclick=|on\w+=/i;

  validate(text: string): boolean {
    if (!text) {
      return true;
    }
    
    // Check for HTML tags and encoded variants
    if (this.HTML_PATTERN.test(text)) {
      return false;
    }
    
    // Check for script injection attempts
    if (this.SCRIPT_PATTERN.test(text)) {
      return false;
    }
    
    return true;
  }

  defaultMessage(): string {
    return 'ERRORS.HTML_NOT_ALLOWED';
  }
}
