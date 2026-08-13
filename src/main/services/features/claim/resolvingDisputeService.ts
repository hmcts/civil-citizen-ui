import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {
  getDraftClaim,
  updateDraftClaim
} from 'modules/draft-store/draftStoreManagerService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('saveResolvingDisputeService');

export const saveResolvingDispute = async (claimId: string) => {
  try {
    const draftId = req.session?.draftId;

    const draftResult = await getDraftClaim(req);
    const claim: Claim = draftResult?.claimResponse?.case_data
    ? Object.assign(new Claim(), draftResult.claimResponse.case_data)
      : new Claim();

    claim.resolvingDispute = true;

    await updateDraftClaim(req, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
