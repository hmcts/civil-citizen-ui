import {HtmlValidator} from 'common/form/validators/htmlValidator';

describe('HtmlValidator', () => {
  const validator = new HtmlValidator();

  describe('validate', () => {
    it('should return true for valid text without HTML', () => {
      expect(validator.validate('This is a normal text')).toBe(true);
      expect(validator.validate('Text with numbers 123 and symbols !@#$%^&*()')).toBe(true);
      expect(validator.validate('Text with quotes "hello" and apostrophes it\'s')).toBe(true);
    });

    it('should return true for empty or null text', () => {
      expect(validator.validate('')).toBe(true);
      expect(validator.validate(null)).toBe(true);
      expect(validator.validate(undefined)).toBe(true);
    });

    it('should return false for text with HTML tags', () => {
      expect(validator.validate('<b>bold text</b>')).toBe(false);
      expect(validator.validate('<script>alert("xss")</script>')).toBe(false);
      expect(validator.validate('Text with <div>html</div>')).toBe(false);
      expect(validator.validate('<p>paragraph</p>')).toBe(false);
      expect(validator.validate('<a href="http://example.com">link</a>')).toBe(false);
    });

    it('should return false for text with encoded HTML entities', () => {
      expect(validator.validate('&lt;script&gt;')).toBe(false);
      expect(validator.validate('&#60;b&#62;')).toBe(false);
      expect(validator.validate('&#x3C;div&#x3E;')).toBe(false);
    });

    it('should return false for text with script injection attempts', () => {
      expect(validator.validate('javascript:alert(1)')).toBe(false);
      expect(validator.validate('<img onerror="alert(1)">')).toBe(false);
      expect(validator.validate('<img onload="alert(1)">')).toBe(false);
      expect(validator.validate('<div onclick="alert(1)">click</div>')).toBe(false);
      expect(validator.validate('<body onload="alert(1)">')).toBe(false);
    });

    it('should return false for text with event handlers', () => {
      expect(validator.validate('onmouseover=alert(1)')).toBe(false);
      expect(validator.validate('onfocus=alert(1)')).toBe(false);
      expect(validator.validate('onblur=alert(1)')).toBe(false);
    });

    it('should return false for text with angle brackets', () => {
      expect(validator.validate('5 < 10')).toBe(false);
      expect(validator.validate('10 > 5')).toBe(false);
      expect(validator.validate('5 < 10 > 3')).toBe(false);
    });
  });

  describe('defaultMessage', () => {
    it('should return the correct error message key', () => {
      expect(validator.defaultMessage()).toBe('ERRORS.HTML_NOT_ALLOWED');
    });
  });
});
