import {getCaseDataFromStore, saveDraftClaim} from './draft-store/draftStoreService';
import {RejectAllOfClaim} from '../common/form/models/rejectAllOfClaim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('rejectAllOfClaimService');

export const getRejectAllOfClaim = async (claimId: string): Promise<RejectAllOfClaim> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.rejectAllOfClaim) {
      return new RejectAllOfClaim(claim.rejectAllOfClaim.option);
    }
    return new RejectAllOfClaim();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
export const getClaimantName = async (claimId: string): Promise<string> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.applicant1?.type === 'ORGANISATION' || claim.applicant1?.type === 'COMPANY') {
      return claim.applicant1.companyName;
    } else if ((claim.applicant1?.type === 'INDIVIDUAL' || claim.applicant1?.type === 'SOLE_TRADER')
      && claim.applicant1?.individualTitle && claim.applicant1?.individualFirstName && claim.applicant1?.individualLastName) {
      return claim.applicant1.individualTitle + ' ' + claim.applicant1.individualFirstName + ' ' + claim.applicant1.individualLastName;
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveRejectAllOfClaim = async (claimId: string, form: RejectAllOfClaim) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.rejectAllOfClaim) {
      claim.rejectAllOfClaim = new RejectAllOfClaim();
    }
    claim.rejectAllOfClaim.option = form.option;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
