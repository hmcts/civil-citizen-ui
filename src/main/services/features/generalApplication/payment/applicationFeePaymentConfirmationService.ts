import {AppRequest} from 'models/AppRequest';
import {
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_PAY_ADDITIONAL_FEE_URL,
  GA_PAYMENT_SUCCESSFUL_URL,
  GA_PAYMENT_UNSUCCESSFUL_URL
} from 'routes/urls';
import { getGaFeePaymentStatus } from '../applicationFee/generalApplicationFeePaymentService';
import { getClaimById } from 'modules/utilityService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('applicationFeePaymentConfirmationService');

const success = 'Success';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (claimId: string, applicationId: string, req: AppRequest): Promise<string> => {
  try {
    const claim = await getClaimById(claimId, req, true);

    const paymentReference = claim.generalApplication?.applicationFeePaymentDetails?.paymentReference;
    const paymentStatus = await getGaFeePaymentStatus(applicationId, paymentReference, req);

    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
    const isAdditionalFee = !!applicationResponse.case_data.applicationFeeAmountInPence;

    if(paymentStatus.status === success) {
      return isAdditionalFee ? '/test' : GA_PAYMENT_SUCCESSFUL_URL;
    }

    const paymentCancelledUrl = isAdditionalFee
      ? GA_PAY_ADDITIONAL_FEE_URL
      : GA_APPLY_HELP_WITH_FEE_SELECTION;
    return paymentStatus.errorDescription !== paymentCancelledByUser ?
      GA_PAYMENT_UNSUCCESSFUL_URL : paymentCancelledUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
