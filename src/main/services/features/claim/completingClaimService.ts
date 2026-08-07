import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('completingClaimService');

export const  saveCompletingClaim = async (req: AppRequest): Promise<void> => {
  try {
    const userId = req.session?.user?.id;
    const draftId = req.session?.draftId;
    const claim = await getCaseDataFromStore(userId);

    claim.completingClaimConfirmed = true;
    await updateDraftClaim(req, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
