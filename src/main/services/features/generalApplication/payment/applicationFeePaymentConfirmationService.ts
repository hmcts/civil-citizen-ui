import {AppRequest} from 'models/AppRequest';
import {
  GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL,
  GA_APPLY_HELP_WITH_FEE_SELECTION, GA_PAYMENT_SUCCESSFUL_COSC_URL,
  GA_PAYMENT_SUCCESSFUL_URL,
  GA_PAYMENT_UNSUCCESSFUL_URL,
  GA_PAYMENT_UNSUCCESSFUL_COSC_URL,
} from 'routes/urls';
import {getGaFeePaymentStatus} from '../applicationFee/generalApplicationFeePaymentService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {displayToEnumKey} from 'services/translation/convertToCUI/cuiTranslation';

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
    const isCoscGa =  displayToEnumKey(applicationResponse.case_data.applicationTypes) === 'CONFIRM_CCJ_DEBT_PAID';

    const paymentCancelledUrl = isAdditionalFee
      ? `${GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL}?lang=${lang}`
      : `${GA_APPLY_HELP_WITH_FEE_SELECTION}?lang=${lang}`;

    if(isCoscGa) {
      if(paymentStatus.status === success) {
        return `${GA_PAYMENT_SUCCESSFUL_COSC_URL}?lang=${lang}`;
      }
      return paymentStatus.errorDescription !== paymentCancelledByUser ?
        `${GA_PAYMENT_UNSUCCESSFUL_COSC_URL}?lang=${lang}` : paymentCancelledUrl;
    }

    if(paymentStatus.status === success) {
      return `${GA_PAYMENT_SUCCESSFUL_URL}?lang=${lang}`;
    }
    return paymentStatus.errorDescription !== paymentCancelledByUser ?
      `${GA_PAYMENT_UNSUCCESSFUL_URL}?lang=${lang}` : paymentCancelledUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
