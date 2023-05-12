import {formatDateToFullDate} from 'common/utils/dateUtils';
import {getLng} from 'common/utils/languageToggleUtils';

export class HearingDateTimeFormatter {
  static getHearingTimeHourMinuteFormatted(hearingTimeHourMinute: string): string {
    const hours = hearingTimeHourMinute.slice(0, 2);
    const minutes = hearingTimeHourMinute.slice(2, 4);
    return `${hours}:${minutes}`;
  }

  static getHearingDateFormatted(hearingDate: Date, lang: string): string {
    return formatDateToFullDate(hearingDate, getLng(lang));
  }
}
