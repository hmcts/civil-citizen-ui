import {Document} from 'models/document/document';
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
    return courtName[0].trim(); // remove any leading or trailing whitespace
  }
}
export class CaseProgressionHearing {
  hearingDocuments?: Document[];
  hearingLocation?: HearingLocation;
  hearingDate?: string;
  hearingTimeHourMinute?: string;

  constructor(hearingDocuments?: Document[], hearingLocation?: HearingLocation, hearingDate?: string, hearingTimeHourMinute?: string) {
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
}
