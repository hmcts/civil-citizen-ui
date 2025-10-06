import { t } from 'i18next';
import { CaseProgressionHearing } from 'models/caseProgression/caseProgressionHearing';

export class HearingDurationFormatter {
  // Adjust these constants according to your business logic (e.g., HOURS_PER_DAY = 6, 8, 24, etc.)
  private static readonly MINUTES_PER_HOUR = 60;
  private static readonly HOURS_PER_DAY = 6;

  /**
   * Main method to format the hearing duration.
   *
   * @param caseProgressionHearing - The hearing data
   * @param lng - The language to be used by i18next
   * @returns The formatted duration string
   */
  static formatHearingDuration(caseProgressionHearing: CaseProgressionHearing, lng: string): string {
    // If hearingDuration is already set, use the translation map.
    if (caseProgressionHearing.hearingDuration != null) {
      return t('COMMON.HEARING_DURATION.' + caseProgressionHearing.hearingDuration.toString(), { lng });
    }
    // Otherwise, calculate and format based on hearingDurationInMinutesAHN
    return this.getTotalHearingDurationText(caseProgressionHearing.hearingDurationInMinutesAHN, lng);
  }

  /**
   * Calculates and formats the total hearing duration text from a duration in minutes.
   *
   * @param hearingDuration - The total hearing duration in minutes
   * @param lng - The language to be used by i18next (if needed for further i18n logic)
   * @returns Formatted text with days, hours, and minutes (or an empty string if null/undefined)
   */
  private static getTotalHearingDurationText(hearingDuration: string, lng: string): string {
    const durationInMinutes: number = this.stringToNumber(hearingDuration);

    const totalDurationInHours = Math.floor(durationInMinutes / this.MINUTES_PER_HOUR);
    const days = Math.floor(totalDurationInHours / this.HOURS_PER_DAY);
    const hours = totalDurationInHours - (days * this.HOURS_PER_DAY);
    const minutes = durationInMinutes - (totalDurationInHours * this.MINUTES_PER_HOUR);

    return this.daysHoursMinutesFormat(days, hours, minutes, lng);
  }

  /**
   * Joins an array of strings with 'and'.
   *
   * @param strings - Array of strings to join
   * @param lng - Language
   * @returns A single string with 'and' as the separator
   */
  private static concatWithAnd(strings: string[], lng: string): string {
    const filtered = strings.filter(s => s != null && s.trim() !== '');
    // e.g. ["2 days", "3 hours"] => "2 days and 3 hours"
    return filtered.join(t('COMMON.HEARING_DURATION.AND', { lng }));
  }

  /**
   * Joins an array of strings with 'and'.
   *
   * @param strings - Array of strings to join
   * @param lng - language
   * @returns A single string with 'and' as the separator
   */
  private static concatWithAndVowel(strings: string[], lng: string): string {
    const filtered = strings.filter(s => s != null && s.trim() !== '');
    // e.g. ["2 days", "3 hours"] => "2 days and 3 hours"
    return filtered.join(t('COMMON.HEARING_DURATION.AND_VOWEL', { lng }));
  }

  /**
   * Returns a string describing hours and minutes (e.g., "2 hours and 15 minutes").
   *
   * @param hours - Number of hours
   * @param minutes - Number of minutes
   * @param lng - Language
   */
  private static hoursMinutesFormat(hours: number, minutes: number, lng: string): string {
    let hoursText;
    if (hours === 0 ){
      hoursText = '';
    } else if (hours === 1) {
      hoursText = this.formatValueWithLabel(hours, t('COMMON.HEARING_DURATION.HOUR', { lng }));
    } else {
      hoursText = this.formatValueWithLabel(hours, t('COMMON.HEARING_DURATION.HOURS', { lng }));
    }

    const minutesText = this.formatMinutes(minutes, lng);

    return this.concatWithAnd([hoursText, minutesText], lng);
  }

  /**
   * Returns a string describing minutes (e.g., "15 minutes").
   *
   * @param minutes - Number of minutes
   * @param lng - Language
   */
  private static formatMinutes(minutes: number, lng: string): string {
    if (minutes === 0 ){
      return '';
    } else if (minutes === 1) {
      return this.formatValueWithLabel(minutes, t('COMMON.HEARING_DURATION.MINUTE', { lng }));
    } else {
      return this.formatValueWithLabel(minutes, t('COMMON.HEARING_DURATION.MINUTES', { lng }));
    }
  }

  /**
   * Returns a string describing days, hours, and minutes
   * (e.g., "1 day and 2 hours and 15 minutes").
   *
   * @param days - Number of days
   * @param hours - Number of hours
   * @param minutes - Number of minutes
   * @param lng - language
   */
  private static daysHoursMinutesFormat(days: number, hours: number, minutes: number, lng: string): string {
    let daysText;
    if (days === 0){
      return this.concatWithAndVowel(['', this.hoursMinutesFormat(hours, minutes, lng)], lng);
    } else if (days === 1) {
      daysText = this.formatValueWithLabel(days, t('COMMON.HEARING_DURATION.DAY', { lng }));
    } else {
      daysText = this.formatValueWithLabel(days, t('COMMON.HEARING_DURATION.DAYS', { lng }));
    }
    // Reuse the hoursMinutesFormat for hours and minutes
    return this.concatWithAndVowel([daysText, this.hoursMinutesFormat(hours, minutes, lng)], lng);
  }

  /**
   * Formats a numeric value with its label, adding an 's' for plural.
   * e.g., "1 hour" / "2 hours", "1 day" / "3 days", etc.
   *
   * @param value - Numeric value
   * @param label - The label (e.g., 'day', 'hour')
   */
  private static formatValueWithLabel(value: number, label: string): string {
    return `${value} ${label}`;
  }

  /**
   * Converts a string into a number.
   * Throws an error if the string cannot be parsed as a valid number.
   *
   * @param value - The string to be converted
   * @returns The parsed number
   */
  private static stringToNumber(value: string): number {
    const parsedValue = Number.parseFloat(value);

    if (Number.isNaN(parsedValue)) {
      throw new Error(`Cannot parse "${value}" as a valid number.`);
    }

    return parsedValue;
  }
}
