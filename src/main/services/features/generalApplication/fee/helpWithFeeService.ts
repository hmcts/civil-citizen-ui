import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {GA_APPLY_HELP_WITH_FEES} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';
import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {
  getGaFeePaymentRedirectInformation,
} from 'services/features/generalApplication/applicationFee/generalApplicationFeePaymentService';
import {getClaimById} from 'modules/utilityService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('applicationFeeHelpSelectionService');

export const getRedirectUrl = async (claimId: string, gaAppId: string, applyHelpWithFees: GenericYesNo, req: AppRequest): Promise<string> => {
  try {
    let redirectUrl;
    const claim: Claim = await getClaimById(claimId, req, true);
    if (applyHelpWithFees.option === YesNo.NO) {
      const paymentRedirectInformation = await getGaFeePaymentRedirectInformation(gaAppId, req);
      claim.generalApplication.applicationFeePaymentDetails = paymentRedirectInformation;
      await saveDraftClaim(claim.id, claim, true);
      redirectUrl = paymentRedirectInformation?.nextUrl;
    } else {
      const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, gaAppId);
      const isAdditionalFee = !!applicationResponse.case_data.generalAppPBADetails?.additionalPaymentServiceRef;
      redirectUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEES + '?additionalFeeTypeFlag='+ isAdditionalFee);
    }
    return redirectUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
