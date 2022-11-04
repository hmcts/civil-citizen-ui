import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {formatDateToFullDate} from '../../../common/utils/dateUtils';
import {ClaimantResponse} from '../../../common/models/claimantResponse';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {getDefendantFullName} from '../response/checkAnswers/detailsSection/buildYourDetailsSection';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('fullAdmitSetDatePaymentService');

export const getFullAdmitSetDatePaymentDetails = async (claimId: string): Promise<{fullAdmitAcceptPayment: GenericYesNo; defendantName: string; proposedSetDate: string}> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    const claimantResponse = (claim?.claimantResponse) ? claim.claimantResponse : new ClaimantResponse();
    const fullAdmitAcceptPayment = claimantResponse.fullAdmitSetDateAcceptPayment;
    const defendantName = getDefendantFullName(claim);
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
