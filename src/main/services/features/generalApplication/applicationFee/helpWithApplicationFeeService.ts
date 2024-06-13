import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLY_HELP_WITH_FEES,
  GA_PAYMENT_SUCCESSFUL_URL,
  GA_PAYMENT_UNSUCCESSFUL_URL
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';
import {
  getGaFeePaymentRedirectInformation, getGaFeePaymentStatus,
} from 'services/features/generalApplication/generalApplicationFeePaymentService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('applicationFeeHelpSelectionService');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const success = 'Success';
const failed = 'Failed';
const paymentCancelledByUser = 'Payment was cancelled by the user';

export const getRedirectUrl = async (claimId: string, applyHelpWithFees: GenericYesNo, req: AppRequest): Promise<string> => {
  try{
    let redirectUrl;
    if (applyHelpWithFees.option === YesNo.NO) {
      const ccdClaim: Claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
      const generalApplicationId = ccdClaim.generalApplications[0].value.caseLink.CaseReference;
      const paymentRedirectInformation = await getGaFeePaymentRedirectInformation(generalApplicationId, req);
      const paymentStatus = await getGaFeePaymentStatus(generalApplicationId, paymentRedirectInformation.paymentReference, req);
      paymentRedirectInformation.status = paymentStatus.status;
      paymentRedirectInformation.errorCode = paymentStatus.errorCode;
      paymentRedirectInformation.errorDescription = paymentStatus.errorDescription;
      if (paymentStatus.status === success) {
        redirectUrl =  constructResponseUrlWithIdParams(claimId, GA_PAYMENT_SUCCESSFUL_URL);
      } else if (paymentStatus.status === failed && paymentStatus.errorDescription !== paymentCancelledByUser) {
        redirectUrl =  constructResponseUrlWithIdParams(claimId, GA_PAYMENT_UNSUCCESSFUL_URL);
      } else {
        redirectUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEE_SELECTION);
      }
    } else {
      redirectUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEES);
    }
    return redirectUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
