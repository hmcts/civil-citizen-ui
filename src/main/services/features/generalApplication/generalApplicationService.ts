import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {ApplicationType} from 'common/models/generalApplication/applicationType';
import {YesNo} from 'form/models/yesNo';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, OLD_DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {isDashboardServiceEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';

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

export const saveApplicationCosts = async (claimId: string, applicationCosts: YesNo): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.applicationCosts = applicationCosts;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getCancelUrl =  (claimId: string, claim: Claim): string => {
  if (claim.isClaimant()) {
    const isDashboardEnabled = isDashboardServiceEnabled();
    if (isDashboardEnabled) {
      return DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
    }
    return OLD_DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
  }
  return DEFENDANT_SUMMARY_URL.replace(':id', claimId);
};
