import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {ClaimantResponse} from '../../../common/models/claimantResponse';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {formatDateToFullDate} from '../../../common/utils/dateUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('fullAdmitSetDatePaymentService');

export const getFullAdmitSetDatePaymentDetails = async (claimId: string): Promise<{fullAdmitAcceptPayment: GenericYesNo; defendantName: string; proposedSetDate: string}> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    const claimantResponse = (claim?.claimantResponse) ? claim.claimantResponse : new ClaimantResponse();
    const fullAdmitAcceptPayment = claimantResponse?.fullAdmitSetDateAcceptPayment;
    const defendantName = claim.getName(claim.respondent1);
    const proposedSetDate = formatDateToFullDate(claim.paymentDate);
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
