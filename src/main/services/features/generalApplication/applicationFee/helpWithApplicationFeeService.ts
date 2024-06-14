import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {GA_APPLY_HELP_WITH_FEES} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {
  getGaFeePaymentRedirectInformation,
} from 'services/features/generalApplication/applicationFee/generalApplicationFeePaymentService';
import {getClaimById} from 'modules/utilityService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('applicationFeeHelpSelectionService');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const getRedirectUrl = async (claimId: string, applyHelpWithFees: GenericYesNo, req: AppRequest): Promise<string> => {
  try {
    let redirectUrl;
    if (applyHelpWithFees.option === YesNo.NO) {
      const claim: Claim = await getClaimById(claimId, req, true);
      const ccdClaim: Claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
      const ccdGeneralApplications = ccdClaim.generalApplications;
      const generalApplicationId = ccdGeneralApplications[ccdGeneralApplications.length-1].value.caseLink.CaseReference;
      const paymentRedirectInformation = await getGaFeePaymentRedirectInformation(generalApplicationId, req);
      claim.generalApplication.applicationFeePaymentDetails = paymentRedirectInformation;
      await saveDraftClaim(claim.id, claim, true);
      redirectUrl = paymentRedirectInformation?.nextUrl;
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
