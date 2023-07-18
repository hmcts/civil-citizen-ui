import {CaseDocument} from 'models/document/caseDocument';
import {HearingDateTimeFormatter} from 'services/features/caseProgression/hearingDateTimeFormatter';
import {CourtNameExtractor} from 'services/features/caseProgression/courtNameExtractor';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

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

export class CaseProgressionHearing {
  hearingDocuments?: CaseProgressionHearingDocuments[];
  hearingLocation?: HearingLocation;
  hearingDate?: Date;
  hearingTimeHourMinute?: string;
  trialReadyApplicant?: YesNoUpperCamelCase;
  trialReadyRespondent1?: YesNoUpperCamelCase;

  constructor(hearingDocuments?: CaseProgressionHearingDocuments[],
    hearingLocation?: HearingLocation,
    hearingDate?: Date,
    hearingTimeHourMinute?: string,
    trialReadyApplicant?: YesNoUpperCamelCase,
    trialReadyRespondent1?: YesNoUpperCamelCase) {

    this.hearingDocuments = hearingDocuments;
    this.hearingLocation = hearingLocation;
    this.hearingDate = hearingDate;
    this.hearingTimeHourMinute = hearingTimeHourMinute;
    this.trialReadyApplicant = trialReadyApplicant;
    this.trialReadyRespondent1 = trialReadyRespondent1;
  }

  getHearingTimeHourMinuteFormatted(): string {
    return HearingDateTimeFormatter.getHearingTimeHourMinuteFormatted(this.hearingTimeHourMinute);

  }

  getHearingDateFormatted(lang: string): string {
    return HearingDateTimeFormatter.getHearingDateFormatted(this.hearingDate, lang);
  }

}
