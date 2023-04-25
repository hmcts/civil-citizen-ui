import {Document} from 'models/document/document';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {getLanguage} from 'modules/i18n/languageService';
export class HearingLocation {
  value: {
    code: string;
    label: string;
  };

  constructor(value?: { code: string; label: string }) {
    this.value = value;
  }

  getCourtName():string{
    const courtName = this.value.label.split('-', 1);
    return courtName[0].trim();
  }
}
export class CaseProgressionHearing {
  hearingDocuments?: Document[];
  hearingLocation?: HearingLocation;
  hearingDate?: Date;
  hearingTimeHourMinute?: string;

  constructor(hearingDocuments?: Document[], hearingLocation?: HearingLocation, hearingDate?: Date, hearingTimeHourMinute?: string) {
    this.hearingDocuments = hearingDocuments;
    this.hearingLocation = hearingLocation;
    this.hearingDate = hearingDate;
    this.hearingTimeHourMinute = hearingTimeHourMinute;
  }

  getHearingTimeHourMinuteFormatted(){
    const hearingTimeHourMinute = this.hearingTimeHourMinute;
    const hours = hearingTimeHourMinute.slice(0, 2);
    const minutes = hearingTimeHourMinute.slice(2, 4);
    return `${hours}:${minutes}`;
  }

  getHearingDateFormatted(){
    return formatDateToFullDate(this.hearingDate, getLanguage());
  }

}
