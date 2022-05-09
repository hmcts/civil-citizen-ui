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
export const getclaimantName = async (claimId: string): Promise<string> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.respondent1?.type === 'ORGANISATION' || claim.respondent1?.type === 'COMPANY') {
      return claim.respondent1.partyName;
    } else if (claim.respondent1?.type === 'INDIVIDUAL' || claim.respondent1?.type === 'SOLE_TRADER') {
      return claim.respondent1.individualTitle + ' ' + claim.respondent1.individualFirstName + ' ' + claim.respondent1.individualLastName;
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
