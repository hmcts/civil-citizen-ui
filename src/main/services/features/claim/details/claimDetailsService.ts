import {AppRequest} from 'models/AppRequest';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimDetailsService');

export const getClaimDetails = async (req: AppRequest): Promise<ClaimDetails> => {
  try {
    const draftResult = await getDraftClaim(req);
    const claim: Claim = Object.assign(new Claim(), draftResult?.claimResponse?.case_data);
    return Object.assign(new ClaimDetails(), claim.claimDetails);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveClaimDetails = async (req: AppRequest, value: unknown, claimDetailsPropertyName: string): Promise<void> => {
  try {
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[claimDetailsService] no draft claim found to update');
    }

    const claim: Claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data);
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;

    if (!claim.claimDetails) {
      claim.claimDetails = new ClaimDetails();
    }
    (claim.claimDetails as Record<string, unknown>)[claimDetailsPropertyName] = value;

    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }

    await updateDraftClaim(req, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
