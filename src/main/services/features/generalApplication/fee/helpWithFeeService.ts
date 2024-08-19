import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {GA_APPLY_HELP_WITH_FEES} from 'routes/urls';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {deleteDraftClaimFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {
  getGaFeePaymentRedirectInformation,
} from 'services/features/generalApplication/applicationFee/generalApplicationFeePaymentService';
import {getClaimById} from 'modules/utilityService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {
  getApplicationFromGAService,
} from 'services/features/generalApplication/generalApplicationService';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {getDraftGAHWFDetails, saveDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('applicationFeeHelpSelectionService');

export const getRedirectUrl = async (claimId: string, applyHelpWithFees: GenericYesNo, hwfPropertyName: keyof GaHelpWithFees, req: AppRequest): Promise<string> => {
  try {
    let redirectUrl;
    let generalApplicationId: string;
    if (req.query?.id) {
      const ccdClaim: Claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
      const ccdGeneralApplications = ccdClaim.generalApplications;
      const ga = ccdGeneralApplications?.find((ga: { id: string }) => ga.id === (req.query.id as string));
      generalApplicationId = ga.value.caseLink.CaseReference;
    } else {
      generalApplicationId = req.params.appId;
    }
    
    if (applyHelpWithFees.option === YesNo.NO) {
      const paymentRedirectInformation = await getGaFeePaymentRedirectInformation(gaAppId, req);
      claim.generalApplication.applicationFeePaymentDetails = paymentRedirectInformation;
      await saveDraftClaim(claim.id, claim, true);
      deleteDraftClaimFromStore(generalApplicationId + req.session.user?.id);
      redirectUrl = paymentRedirectInformation?.nextUrl;
    } else {
      const gaHwFDetails = await getDraftGAHWFDetails(generalApplicationId + req.session.user?.id)
      if (req.query.appFee) {
        gaHwFDetails.applicationFee = <string>req.query.appFee;
      }
      (<GenericYesNo>gaHwFDetails[hwfPropertyName]) = applyHelpWithFees;
      await saveDraftGAHWFDetails(generalApplicationId + req.session.user?.id, gaHwFDetails);
      const applicationResponse: ApplicationResponse = await getApplicationFromGAService(req, generalApplicationId);
      const isAdditionalFee = !!applicationResponse.case_data.generalAppPBADetails?.additionalPaymentServiceRef;
      redirectUrl =  constructResponseUrlWithIdAndAppIdParams(claimId, generalApplicationId, GA_APPLY_HELP_WITH_FEES + '?additionalFeeTypeFlag='+ isAdditionalFee);
    }
    return redirectUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
