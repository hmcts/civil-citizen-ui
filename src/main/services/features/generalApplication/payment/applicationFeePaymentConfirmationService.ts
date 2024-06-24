import {AppRequest} from 'models/AppRequest';
import {
  DASHBOARD_URL, GA_PAYMENT_SUCCESSFUL_URL, GA_PAYMENT_UNSUCCESSFUL_URL,
} from 'routes/urls';
import { getGaFeePaymentStatus } from '../applicationFee/generalApplicationFeePaymentService';
import { getApplicationFromGAService } from '../generalApplicationService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('applicationFeePaymentConfirmationService');

const success = 'Success';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (applicationId: string, req: AppRequest): Promise<string> => {
  try {
    const applicationResponse = await getApplicationFromGAService(req, applicationId);
    console.log(applicationResponse);
    const paymentReference = applicationResponse.case_data?.generalAppPBADetails?.paymentDetails?.paymentReference;
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
