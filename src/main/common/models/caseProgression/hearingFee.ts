import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {CCDClaimFee} from 'models/ccdResponse/ccdClaimFee';
import {HearingDateTimeFormatter} from 'services/features/caseProgression/hearingDateTimeFormatter';

export class HearingFee {
  claimFee?: CCDClaimFee;
  hearingDueDate?: Date;

  constructor(claimFee?: CCDClaimFee, hearingDueDate?: Date) {
    this.claimFee = claimFee;
    this.hearingDueDate = hearingDueDate;
  }

  getClaimFeeFormatted(): number {
    return convertToPoundsFilter(this.claimFee.calculatedAmountInPence);
  }

  getHearingDueDateFormatted(lang:string): string {
    return HearingDateTimeFormatter.getHearingDateFormatted(this.hearingDueDate, lang);
  }
}

export enum CaseProgressionHearingFeeType {
  HEARING = 'HEARING',
}
