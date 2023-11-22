import {ClaimantResponse} from 'common/models/claimantResponse';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Claim} from 'models/claim';
import { t } from 'i18next';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('fullAdmitSetDatePaymentService');

export const getSetDatePaymentDetails = (claim: Claim, lang: string): {fullAdmitAcceptPayment: GenericYesNo; defendantName: string; proposedSetDate: string} => {
  try {
    const claimantResponse = (claim?.claimantResponse) ? claim.claimantResponse : new ClaimantResponse();
    const fullAdmitAcceptPayment = claimantResponse?.fullAdmitSetDateAcceptPayment;
    const defendantName = claim.getDefendantFullName();
    const paymentIntention = claim.getPaymentIntention();
    const proposedSetDate = t(formatDateToFullDate(paymentIntention?.paymentDate, lang));
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
