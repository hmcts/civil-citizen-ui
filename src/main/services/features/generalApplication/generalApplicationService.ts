import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import { YesNo } from 'common/form/models/yesNo';
import { isDashboardServiceEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import { DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, OLD_DASHBOARD_CLAIMANT_URL } from '../../../routes/urls';
import { Claim } from 'common/models/claim';
import { AppRequest } from 'common/models/AppRequest';
import { FormValidationError } from 'common/form/validationErrors/formValidationError';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { ValidationError } from 'class-validator';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');

export const saveApplicationType = async (claimId: string, applicationType: ApplicationType): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.applicationType = applicationType;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveAgreementFromOtherParty = async (claimId: string, claim: Claim, agreementFromOtherParty: YesNo): Promise<void> => {
  try {
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.agreementFromOtherParty = agreementFromOtherParty;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getCancelUrl = async (claimId: string, claim: Claim): Promise<string> => {
  if (claim.isClaimant()) {
    const isDashboardEnabled = await isDashboardServiceEnabled();
    if (isDashboardEnabled) {
      return constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    }
    return constructResponseUrlWithIdParams(claimId, OLD_DASHBOARD_CLAIMANT_URL);
  }
  return constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
};

export function validateNoConsentOption(req: AppRequest, errors : ValidationError[], applicationTypeOption : string) {
 
  if(req.body.option === YesNo.NO && applicationTypeOption === ApplicationTypeOption.SETTLE_BY_CONSENT) {
   
    const validationError = new FormValidationError({
      target: new GenericYesNo(req.body.option, ''),
      value: req.body.option,
      constraints: {
        shouldNotBeNoForSettleByConsent :'ERRORS.GENERAL_APPLICATION.APPLICATION_FROM_OTHER_PARTY_OPTION_NO_SELECTED',
      },
      property: 'option',
    });

    errors.push(validationError);
  }
}