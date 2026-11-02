import {CaseDocument} from 'models/document/caseDocument';
import {HearingDateTimeFormatter} from 'services/features/caseProgression/hearingDateTimeFormatter';
import {CourtNameExtractor} from 'services/features/caseProgression/courtNameExtractor';
import {HearingDuration} from 'models/caseProgression/hearingDuration';
import {DocumentType} from 'models/document/documentType';
import {CaseDocumentInfoExtractor} from 'services/features/caseProgression/SystemDocumentInfoExtractor';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {PaymentDetails} from 'models/PaymentDetails';
import { getNumberOfDaysBetweenTwoDays } from 'common/utils/dateUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('caseProgressionHearing');

export class HearingLocation {
  value?: {
    code: string;
    label: string;
  };

  constructor(value?: { code: string; label: string }) {
    this.value = value;
  }

  getCourtName():string{
    if (!this.value?.label) {
      logger.warn('[HearingLocation.getCourtName] hearing location label missing, returning empty court name');
      return '';
    }
    return CourtNameExtractor.extractCourtName(this.value.label);
  }
}

export class  CaseProgressionHearingDocuments{
  id: string;
  value: CaseDocument;
}

export const getHearingDocumentsCaseDocumentIdByType = ((hearingDocuments: CaseProgressionHearingDocuments[], documentType: DocumentType) => {
  let documentId: string | null | undefined;
  if (hearingDocuments?.length) {
    documentId = CaseDocumentInfoExtractor.getSystemGeneratedCaseDocumentIdByType(hearingDocuments, documentType);
  }
  return documentId;
});

export class CaseProgressionHearing {
  hearingDocuments?: CaseProgressionHearingDocuments[];
  hearingDocumentsWelsh?: CaseProgressionHearingDocuments[];
  hearingLocation?: HearingLocation;
  hearingDate?: Date;
  hearingTimeHourMinute?: string;
  hearingDuration?: HearingDuration;
  hearingFeeInformation?: HearingFeeInformation;
  hearingFeePaymentDetails?: PaymentDetails;
  hearingDurationInMinutesAHN?: string;
  constructor(hearingDocuments?: CaseProgressionHearingDocuments[],
    hearingLocation?: HearingLocation,
    hearingDate?: Date,
    hearingTimeHourMinute?: string,
    hearingDuration?: HearingDuration,
    hearingFeeInformation?: HearingFeeInformation,
    hearingFeePaymentDetails?: PaymentDetails,
    hearingDurationInMinutesAHN?: string) {
    this.hearingDocuments = hearingDocuments;
    this.hearingLocation = hearingLocation;
    this.hearingDate = hearingDate;
    this.hearingTimeHourMinute = hearingTimeHourMinute;
    this.hearingDuration = hearingDuration;
    this.hearingFeeInformation = hearingFeeInformation;
    this.hearingFeePaymentDetails = hearingFeePaymentDetails;
    this.hearingDurationInMinutesAHN = hearingDurationInMinutesAHN;
  }

  getHearingTimeHourMinuteFormatted(): string {
    if (!this.hearingTimeHourMinute) {
      logger.warn('[CaseProgressionHearing.getHearingTimeHourMinuteFormatted] hearingTimeHourMinute missing, returning empty string');
      return '';
    }
    return HearingDateTimeFormatter.getHearingTimeHourMinuteFormatted(this.hearingTimeHourMinute);
  }

  getHearingDateFormatted(lang: string): string {
    if (!this.hearingDate) {
      logger.warn('[CaseProgressionHearing.getHearingDateFormatted] hearingDate missing, returning empty string');
      return '';
    }
    return HearingDateTimeFormatter.getHearingDateFormatted(this.hearingDate, lang);
  }

  getDurationOfDaysForHearing(): number | undefined {
    if (this.hearingDate) {
      return getNumberOfDaysBetweenTwoDays(new Date(), this.hearingDate);
    }
  }
}
