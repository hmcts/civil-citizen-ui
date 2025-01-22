import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {
  APPLICATION_FEE_PAYMENT_CONFIRMATION_URL,
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
  getGaFeePaymentRedirectInformation, getGaFeePaymentStatus,
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
const success = 'Success';
const failed = 'Failed';

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
      claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);

      let paymentRedirectInformation;
      if (claim.generalApplication?.applicationFeePaymentDetails?.paymentReference){
        logger.info(`Existing paymentReference ${claim.generalApplication.applicationFeePaymentDetails?.paymentReference}`);
        paymentRedirectInformation = claim.generalApplication.applicationFeePaymentDetails;
      } else {
        paymentRedirectInformation = await getGaFeePaymentRedirectInformation(generalApplicationId, req);
        claim.generalApplication.applicationFeePaymentDetails = paymentRedirectInformation;
        logger.info(`New paymentReference ${claim.generalApplication.applicationFeePaymentDetails?.paymentReference}`);
      }
      await saveDraftClaim(generateRedisKey(<AppRequest>req), claim, true);
      await saveUserId(claimId, req.session.user.id);
      try {
        const paymentReference = claim.generalApplication.applicationFeePaymentDetails?.paymentReference;
        const paymentStatus = await getGaFeePaymentStatus(generalApplicationId, paymentReference, req);
        logger.info(`Existing payment status for application id ${generalApplicationId}: ${paymentStatus?.status}`);
        if (paymentStatus?.status === success) {
          logger.info(`Redirecting to claim fee payment confirmation url for claim id ${claimId}`);
          redirectUrl = constructResponseUrlWithIdAndAppIdParams(claimId, generalApplicationId, APPLICATION_FEE_PAYMENT_CONFIRMATION_URL);
        } else if (paymentStatus?.status === failed) {
          paymentRedirectInformation = await getGaFeePaymentRedirectInformation(generalApplicationId, req);
          logger.info(`New payment ref after failed payment for application id ${generalApplicationId}: ${paymentRedirectInformation?.paymentReference}`);
          if (!paymentRedirectInformation) {
            redirectUrl = req.originalUrl;
          } else {
            claim.generalApplication.applicationFeePaymentDetails = paymentRedirectInformation;
            await saveDraftClaim(generateRedisKey(<AppRequest>req), claim, true);
            redirectUrl = paymentRedirectInformation?.nextUrl;
          }
        } else {
          redirectUrl = paymentRedirectInformation?.nextUrl;
        }
      } catch (err: unknown) {
        logger.info(`Error retrieving payment status for application id ${generalApplicationId}, payment ref ${paymentRedirectInformation?.paymentReference}`);
        redirectUrl = paymentRedirectInformation?.nextUrl;
      }
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
