import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {CCDClaimFee} from 'models/ccdResponse/ccdClaimFee';
import {HearingDateTimeFormatter} from 'services/features/caseProgression/hearingDateTimeFormatter';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('hearingFee');

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

  getHearingFeeFormatted(): number | undefined {
    const amountInPence = this.hearingFee?.calculatedAmountInPence;
    if (amountInPence === undefined || amountInPence === null) {
      logger.warn('[HearingFeeInformation.getHearingFeeFormatted] calculatedAmountInPence missing, returning undefined');
      return undefined;
    }
    return convertToPoundsFilter(amountInPence);
  }

  getHearingDueDateFormatted(lang: string): string | undefined {
    if (!this.hearingDueDate) {
      logger.warn('[HearingFeeInformation.getHearingDueDateFormatted] hearingDueDate missing, returning undefined');
      return undefined;
    }
    return HearingDateTimeFormatter.getHearingDateFormatted(this.hearingDueDate, lang);
  }
}

