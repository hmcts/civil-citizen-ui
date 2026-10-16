import {DateFormatter} from 'common/utils/dateFormatter';

describe('DateFormatter', () => {
  describe('setDateFormat', () => {
    it('should format date with locale and options', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const result = DateFormatter.setDateFormat(date, 'en-GB', {year: 'numeric', month: 'long', day: 'numeric'});
      expect(result).toContain('2024');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('setMonth', () => {
    it('should add months to a date', () => {
      const date = new Date(2024, 0, 15);
      DateFormatter.setMonth(date, 2);
      expect(date.getMonth()).toEqual(2);
      expect(date.getFullYear()).toEqual(2024);
    });

    it('should subtract months from a date', () => {
      const date = new Date(2024, 2, 15);
      DateFormatter.setMonth(date, -1);
      expect(date.getMonth()).toEqual(1);
    });

    it('should roll year when adding past December', () => {
      const date = new Date(2024, 11, 15);
      DateFormatter.setMonth(date, 1);
      expect(date.getMonth()).toEqual(0);
      expect(date.getFullYear()).toEqual(2025);
    });
  });
});
