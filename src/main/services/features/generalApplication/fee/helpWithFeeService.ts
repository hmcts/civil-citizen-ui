import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLY_HELP_WITH_FEES,
} from 'routes/urls';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';
import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {
  getGaFeePaymentRedirectInformation,
} from 'services/features/generalApplication/applicationFee/generalApplicationFeePaymentService';
import {getClaimById} from 'modules/utilityService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('applicationFeeHelpSelectionService');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
export const getRedirectUrl = async (claimId: string, applyHelpWithFees: GenericYesNo, req: AppRequest): Promise<string> => {
  try {
    let redirectUrl;
    let generalApplicationId: string;
    const claim: Claim = await getClaimById(claimId, req, true);
    if (req.query?.id) {
      const ccdClaim: Claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
      const ccdGeneralApplications = ccdClaim.generalApplications;
      const ga = ccdGeneralApplications?.find((ga: { id: string }) => ga.id === (req.query.id as string));
      generalApplicationId = ga.value.caseLink.CaseReference;
    } else {
      generalApplicationId = req.params.appId;
    }

    if (applyHelpWithFees.option === YesNo.NO) {
      const paymentRedirectInformation = await getGaFeePaymentRedirectInformation(generalApplicationId, req);
      claim.generalApplication.applicationFeePaymentDetails = paymentRedirectInformation;
      await saveDraftClaim(claim.id, claim, true);
      redirectUrl = paymentRedirectInformation?.nextUrl;
    } else {
      const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, generalApplicationId);
      const isAdditionalFee = !!applicationResponse.case_data.generalAppPBADetails?.additionalPaymentServiceRef;
      redirectUrl =constructResponseUrlWithIdAndAppIdParams(claimId, generalApplicationId, GA_APPLY_HELP_WITH_FEES + '?additionalFeeTypeFlag='+ isAdditionalFee);
    }
    return redirectUrl;
  }
  catch (error) {
    logger.error(error);
    const claim = await getClaimById(req.params.id, req, true);
    let generalApplicationId: string;
    if (req.query?.id) {
      const ccdClaim: Claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
      const ccdGeneralApplications = ccdClaim.generalApplications;
      const ga = ccdGeneralApplications?.find((ga: { id: string }) => ga.id === (req.query.id as string));
      generalApplicationId = ga.value.caseLink.CaseReference;
    } else {
      generalApplicationId = req.params.appId;
    }
    claim.paymentSyncError = true;
    await saveDraftClaim(claim.id, claim, true);
    return constructResponseUrlWithIdAndAppIdParams(claimId, generalApplicationId, GA_APPLY_HELP_WITH_FEE_SELECTION);
  }
};
