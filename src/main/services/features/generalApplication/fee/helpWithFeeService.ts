import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLY_HELP_WITH_FEES,
} from 'routes/urls';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {
  getGaFeePaymentRedirectInformation,
} from 'services/features/generalApplication/applicationFee/generalApplicationFeePaymentService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {
  getApplicationFromGAService,
} from 'services/features/generalApplication/generalApplicationService';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {getDraftGAHWFDetails, saveDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {getClaimById} from 'modules/utilityService';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {saveUserId} from 'modules/draft-store/paymentSessionStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('applicationFeeHelpSelectionService');
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const getRedirectUrl = async (claimId: string, applyHelpWithFees: GenericYesNo, hwfPropertyName: keyof GaHelpWithFees, req: AppRequest): Promise<string> => {
  try {
    let redirectUrl;
    let generalApplicationId: string;
    const claim: Claim = await getClaimById(claimId, req, true);
    if (req.query?.id) {
      const ccdClaim: Claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
      const ccdGeneralApplications = ccdClaim.generalApplications;
      const ga = ccdGeneralApplications?.find((ga: { id: string }) => ga.id === (req.query.id as string));
      generalApplicationId = ga?.value?.caseLink?.CaseReference;
      if (!generalApplicationId) {
        claim.paymentSyncError = true;
        await saveDraftClaim(generateRedisKey(<AppRequest>req), claim, true);
        return req.originalUrl;
      }
    } else {
      generalApplicationId = req.params.appId;
    }

    if (applyHelpWithFees.option === YesNo.NO) {
      const paymentRedirectInformation = await getGaFeePaymentRedirectInformation(generalApplicationId, req);
      claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
      claim.generalApplication.applicationFeePaymentDetails = paymentRedirectInformation;
      await saveDraftClaim(generateRedisKey(<AppRequest>req), claim, true);
      await saveUserId(claimId, req.session.user.id);
      redirectUrl = paymentRedirectInformation?.nextUrl;
    } else {
      const gaHwFDetails = await getDraftGAHWFDetails(generalApplicationId + req.session.user?.id);
      if (req.query.appFee) {
        gaHwFDetails.applicationFee = <string>req.query.appFee;
      }
      (<GenericYesNo>gaHwFDetails[hwfPropertyName]) = applyHelpWithFees;
      const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, generalApplicationId);
      const isAdditionalFee = !!applicationResponse.case_data.generalAppPBADetails?.additionalPaymentServiceRef;
      if (isAdditionalFee) {
        const additionalFeePounds = convertToPoundsFilter(applicationResponse?.case_data?.generalAppPBADetails?.fee?.calculatedAmountInPence);
        gaHwFDetails.additionalFee = additionalFeePounds.toString();
      }
      await saveDraftGAHWFDetails(generalApplicationId + req.session.user?.id, gaHwFDetails);
      redirectUrl =  constructResponseUrlWithIdAndAppIdParams(claimId, generalApplicationId, GA_APPLY_HELP_WITH_FEES + '?additionalFeeTypeFlag='+ isAdditionalFee);
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
    await saveDraftClaim(generateRedisKey(<AppRequest>req), claim, true);
    return constructResponseUrlWithIdAndAppIdParams(claimId, generalApplicationId, GA_APPLY_HELP_WITH_FEE_SELECTION);
  }
};
