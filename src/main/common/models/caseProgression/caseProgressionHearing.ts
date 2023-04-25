import {Document} from 'models/document/document';
export class HearingLocation {
  value: {
    code: string;
    label: string;
  };
  getCourtName():string{
    const courtName = this.value.label.split('-', 1);
    return courtName[0].trim(); // remove any leading or trailing whitespace
  }
}
export class CaseProgressionHearing {
  hearingDocuments?: Document[];
  hearingLocation?: HearingLocation;
  hearingDate?: string;

  constructor(hearingDocuments?: Document[], hearingLocation?: HearingLocation, hearingDate?: string) {
    this.hearingDocuments = hearingDocuments;
    this.hearingLocation = hearingLocation;
    this.hearingDate = hearingDate;
  }
}
