import {
  generateRedisKey,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {getClaimById} from 'modules/utilityService';
import {Request} from 'express';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';

export const savePcqIdClaim = async (pcqId: string, req: AppRequest) => {
  const draftResult = await getDraftClaim(req);
  if (!draftResult) {
    throw new Error('[savePcqIdClaim] no draft claim found');
  }

  const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
  const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;
  claim.pcqId = pcqId;
  if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
    claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
  }
  await updateDraftClaim(req, claim, draftId);
};

export const savePcqId = async (pcqId: string, req: Request, claimId: string) => {
  const appRequest = req as AppRequest;
  const claim = await getClaimById(claimId, req,true);
  claim.respondentResponsePcqId = pcqId;
  await saveDraftClaim(generateRedisKey(appRequest), claim, false, appRequest.session?.user?.id);
};
