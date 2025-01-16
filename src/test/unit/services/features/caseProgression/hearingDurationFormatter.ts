/**
 * @file hearingDurationFormatter.test.ts
 */
import { HearingDurationFormatter } from 'services/features/caseProgression/hearingDurationFormatter';
import { CaseProgressionHearing } from 'models/caseProgression/caseProgressionHearing';
import { HearingDuration } from 'models/caseProgression/hearingDuration';
import { t } from 'i18next';

/**
 * Mocking i18next to control the output of t(...)
 * Here, we return placeholders or real strings for different keys.
 * Adjust as needed for your translation structure.
 */
jest.mock('i18next', () => ({
  t: jest.fn((key: string, options?: Record<string, any>) => {
    switch (key) {
      case 'COMMON.HEARING_DURATION.MINUTES_60':
        return '1 hour';
      case 'COMMON.HEARING_DURATION.AND':
        return ' and ';
      case 'COMMON.HEARING_DURATION.AND_VOWEL':
        return ' and ';
      case 'COMMON.HEARING_DURATION.HOUR':
        return 'hour';
      case 'COMMON.HEARING_DURATION.HOURS':
        return 'hours';
      case 'COMMON.HEARING_DURATION.MINUTE':
        return 'minute';
      case 'COMMON.HEARING_DURATION.MINUTES':
        return 'minutes';
      case 'COMMON.HEARING_DURATION.DAY':
        return 'day';
      case 'COMMON.HEARING_DURATION.DAYS':
        return 'days';
      default:
        return key;
    }
  }),
}));

describe('HearingDurationFormatter', () => {
  describe('formatHearingDuration', () => {
    it('should use the translation directly when hearingDuration is set', () => {
      // Given a hearing with a known hearingDuration
      const mockHearing: CaseProgressionHearing = {
        hearingDuration: HearingDuration.MINUTES_60,
        hearingDurationInMinutesAHN: '60', // or any value, won't be used
      };

      // When
      const result = HearingDurationFormatter.formatHearingDuration(mockHearing, 'en');

      // Then
      // We expect it to come from the translation for 'COMMONS.HEARING_DURATION.MINUTES_60'
      expect(result).toBe('1 hour');
      // Also verify that `t` was called with the right key:
      expect(t).toHaveBeenCalledWith(
        'COMMON.HEARING_DURATION.' + mockHearing.hearingDuration.toString(),
        { lng: 'en' }
      );
    });

    it('should calculate duration when hearingDuration is null', () => {
      // Given a hearing where hearingDuration is null
      // but hearingDurationInMinutesAHN is "60"
      const mockHearing: CaseProgressionHearing = {
        hearingDuration: null,
        hearingDurationInMinutesAHN: '60',
      };

      // When
      const result = HearingDurationFormatter.formatHearingDuration(mockHearing, 'en');

      // Then
      // By default, 60 minutes => 0 days, 1 hour, 0 minutes
      // hoursMinutesFormat => "1 hour"
      // Because 'minutes' = 0 -> returns blank
      // So final result => "1 hour"
      // But the code inserts " and " if there are two parts.
      // In this scenario, minutes is zero, so it might be empty,
      // effectively giving "1 hour".
      expect(result).toContain('1 hour');
    });

    it('should format multiple hours/minutes (e.g. 135 minutes = 2 hours and 15 minutes)', () => {
      // 135 minutes -> 2 hours, 15 minutes
      const mockHearing: CaseProgressionHearing = {
        hearingDuration: null,
        hearingDurationInMinutesAHN: '135',
      };

      const result = HearingDurationFormatter.formatHearingDuration(mockHearing, 'en');

      // Expect 2 hours and 15 minutes
      expect(result).toBe('2 hours and 15 minutes');
    });

    it('should format days if total duration >= (HOURS_PER_DAY * MINUTES_PER_HOUR)', () => {
      // HOURS_PER_DAY = 6, so 1 "day" = 6 * 60 = 360 minutes
      // Let's say we have 420 minutes => 7 hours
      // => 1 day and 1 hour
      const mockHearing: CaseProgressionHearing = {
        hearingDuration: null,
        hearingDurationInMinutesAHN: '420',
      };

      const result = HearingDurationFormatter.formatHearingDuration(mockHearing, 'en');

      // 420 minutes => 1 day and 1 hour
      // => "1 day and 1 hour"
      expect(result).toBe('1 day and 1 hour');
    });

    it('should handle 0 minutes (resulting in empty string for hours/minutes)', () => {
      const mockHearing: CaseProgressionHearing = {
        hearingDuration: null,
        hearingDurationInMinutesAHN: '0',
      };

      const result = HearingDurationFormatter.formatHearingDuration(mockHearing, 'en');

      // 0 minutes => 0 hours, 0 minutes, 0 days => effectively ""
      expect(result).toBe('');
    });

    it('should throw an error for invalid string input', () => {
      const mockHearing: CaseProgressionHearing = {
        hearingDuration: null,
        hearingDurationInMinutesAHN: 'not-a-number',
      };

      expect(() => {
        HearingDurationFormatter.formatHearingDuration(mockHearing, 'en');
      }).toThrowError(`Cannot parse "not-a-number" as a valid number.`);
    });
  });
});
