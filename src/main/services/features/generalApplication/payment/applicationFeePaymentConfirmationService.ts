import {AppRequest} from 'models/AppRequest';
import {
  DASHBOARD_URL, GA_PAYMENT_SUCCESSFUL_URL, GA_PAYMENT_UNSUCCESSFUL_URL,
} from 'routes/urls';
import { getGaFeePaymentStatus } from '../applicationFee/generalApplicationFeePaymentService';
import { getClaimById } from 'modules/utilityService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('applicationFeePaymentConfirmationService');

const success = 'Success';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (claimId: string, applicationId: string, req: AppRequest): Promise<string> => {
  try {
    const claim = await getClaimById(claimId, req, true);
 
    const paymentReference = claim.generalApplication?.applicationFeePaymentDetails?.paymentReference;
    const paymentStatus = await getGaFeePaymentStatus(applicationId, paymentReference, req);

    if(paymentStatus.status === success) {
      return GA_PAYMENT_SUCCESSFUL_URL;
    }

    return paymentStatus.errorDescription !== paymentCancelledByUser ?
      GA_PAYMENT_UNSUCCESSFUL_URL : DASHBOARD_URL;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
