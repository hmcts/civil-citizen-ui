import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {CCDClaimFee} from 'models/ccdResponse/ccdClaimFee';
import {HearingDateTimeFormatter} from 'services/features/caseProgression/hearingDateTimeFormatter';

export class HearingFee implements CCDClaimFee {
  calculatedAmountInPence: string;
  code: string;
  version: string;
}

export class HearingFeeInformation {
  hearingFee?: HearingFee;
  hearingDueDate?: Date;

  constructor(hearingFee?: HearingFee, hearingDueDate?: Date) {
    this.hearingFee = hearingFee;
    this.hearingDueDate = hearingDueDate;
  }

  getHearingFeeFormatted(): number {
    return convertToPoundsFilter(this.hearingFee?.calculatedAmountInPence);
  }

  getHearingDueDateFormatted(lang: string): string {
    return HearingDateTimeFormatter.getHearingDateFormatted(this.hearingDueDate, lang);
  }
}

