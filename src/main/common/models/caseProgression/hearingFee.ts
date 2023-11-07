import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {CCDClaimFee} from 'models/ccdResponse/ccdClaimFee';

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
}

export enum CaseProgressionHearingFeeType {
  HEARING = 'HEARING',
  CLAIMISSUED = 'CLAIMISSUED',
}
