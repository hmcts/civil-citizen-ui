import {AppRequest} from 'models/AppRequest';
import {
  GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL,
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_PAYMENT_SUCCESSFUL_URL,
  GA_PAYMENT_UNSUCCESSFUL_URL,
} from 'routes/urls';
import {getGaFeePaymentStatus} from '../applicationFee/generalApplicationFeePaymentService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('applicationFeePaymentConfirmationService');

const success = 'Success';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (claimId: string, applicationId: string, req: AppRequest): Promise<string> => {
  try {
    const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, applicationId);
    const claim: Claim = await getClaimById(claimId, req, true);
    const paymentReference = claim.generalApplication?.applicationFeePaymentDetails?.paymentReference;
    const paymentStatus = await getGaFeePaymentStatus(applicationId, paymentReference, req);
    const isAdditionalFee = !!applicationResponse.case_data.generalAppPBADetails?.additionalPaymentServiceRef;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    console.log('getRedirectUrl lang->' + lang);
    if(paymentStatus.status === success) {
      return `${GA_PAYMENT_SUCCESSFUL_URL}?lang=${lang}`;
    }

    const paymentCancelledUrl = isAdditionalFee
      ? `${GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL}?lang=${lang}`
      : `${GA_APPLY_HELP_WITH_FEE_SELECTION}?lang=${lang}`;
    return paymentStatus.errorDescription !== paymentCancelledByUser ?
      `${GA_PAYMENT_UNSUCCESSFUL_URL}?lang=${lang}` : paymentCancelledUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
