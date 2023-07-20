import {CaseDocument} from 'models/document/caseDocument';
import {HearingDateTimeFormatter} from 'services/features/caseProgression/hearingDateTimeFormatter';
import {CourtNameExtractor} from 'services/features/caseProgression/courtNameExtractor';
import {DocumentType} from "models/document/documentType";
import {CaseDocumentInfoExtractor} from "services/features/caseProgression/SystemDocumentInfoExtractor";

export class HearingLocation {
  value: {
    code: string;
    label: string;
  };

  constructor(value?: { code: string; label: string }) {
    this.value = value;
  }

  getCourtName():string{
    return CourtNameExtractor.extractCourtName(this.value.label);
  }
}

export class  CaseProgressionHearingDocuments{
  id: string;
  value: CaseDocument;
}

export const getHearingDocumentsCaseDocumentIdByType = ((hearingDocuments: CaseProgressionHearingDocuments[], documentType: DocumentType) => {
  let documentId: string;
  if (hearingDocuments?.length) {
    documentId = CaseDocumentInfoExtractor.getSystemGeneratedCaseDocumentIdByType(hearingDocuments, documentType);
  }
  return documentId;
});

export class CaseProgressionHearing {
  hearingDocuments?: CaseProgressionHearingDocuments[];
  hearingLocation?: HearingLocation;
  hearingDate?: Date;
  hearingTimeHourMinute?: string;

  constructor(hearingDocuments?: CaseProgressionHearingDocuments[], hearingLocation?: HearingLocation, hearingDate?: Date, hearingTimeHourMinute?: string) {
    this.hearingDocuments = hearingDocuments;
    this.hearingLocation = hearingLocation;
    this.hearingDate = hearingDate;
    this.hearingTimeHourMinute = hearingTimeHourMinute;
  }

  getHearingTimeHourMinuteFormatted(): string {
    return HearingDateTimeFormatter.getHearingTimeHourMinuteFormatted(this.hearingTimeHourMinute);

  }

  getHearingDateFormatted(lang: string): string {
    return HearingDateTimeFormatter.getHearingDateFormatted(this.hearingDate, lang);
  }

}
