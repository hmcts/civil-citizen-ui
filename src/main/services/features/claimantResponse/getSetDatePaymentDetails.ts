import {ClaimantResponse} from 'common/models/claimantResponse';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Claim} from 'models/claim';
import {getLng} from 'common/utils/languageToggleUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('fullAdmitSetDatePaymentService');

export const getSetDatePaymentDetails = (claim: Claim, lang: string): {fullAdmitAcceptPayment: GenericYesNo; defendantName: string; proposedSetDate: string} => {
  try {
    const claimantResponse = (claim?.claimantResponse) ? claim.claimantResponse : new ClaimantResponse();
    const fullAdmitAcceptPayment = claimantResponse?.fullAdmitSetDateAcceptPayment;
    const defendantName = claim.getDefendantFullName();
    const paymentIntention = claim.getPaymentIntention();
    const proposedSetDate = formatDateToFullDate(paymentIntention?.paymentDate, getLng(lang));
    return {
      fullAdmitAcceptPayment,
      defendantName,
      proposedSetDate,
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
