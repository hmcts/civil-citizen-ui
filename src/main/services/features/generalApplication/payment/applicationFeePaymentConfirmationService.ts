import {AppRequest} from 'models/AppRequest';
import {
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL,
  GA_PAYMENT_SUCCESSFUL_URL,
  GA_PAYMENT_UNSUCCESSFUL_URL,
} from 'routes/urls';
import {
  getGaFeePaymentRedirectInformation,
  getGaFeePaymentStatus,
} from '../applicationFee/generalApplicationFeePaymentService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('applicationFeePaymentConfirmationService');

const success = 'Success';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (claimId: string, applicationId: string, req: AppRequest): Promise<string> => {
  try {
    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
    const paymentRedirectInformation = await getGaFeePaymentRedirectInformation(applicationId, req);
    const paymentReference = paymentRedirectInformation.paymentReference;
    const paymentStatus = await getGaFeePaymentStatus(applicationId, paymentReference, req);
    const isAdditionalFee = !!applicationResponse.case_data.generalAppPBADetails?.additionalPaymentServiceRef;

    if(paymentStatus.status === success) {
      return GA_PAYMENT_SUCCESSFUL_URL;
    }

    const paymentCancelledUrl = isAdditionalFee
      ? GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL
      : GA_APPLY_HELP_WITH_FEE_SELECTION;
    return paymentStatus.errorDescription !== paymentCancelledByUser ?
      GA_PAYMENT_UNSUCCESSFUL_URL : paymentCancelledUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
