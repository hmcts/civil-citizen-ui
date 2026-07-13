import {
  generateRedisKey, getCaseDataFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Request} from 'express';
import {AppRequest} from 'models/AppRequest';

export const savePcqIdClaim = async (pcqId: string, userId: string) => {
  const claim = await getCaseDataFromStore(userId);
  claim.pcqId = pcqId;
  await saveDraftClaim(userId, claim, false, userId);
};

export const savePcqId = async (pcqId: string, req: Request, claimId: string) => {
  const appRequest = req as AppRequest;
  const claim = await getClaimById(claimId, req,true);
  claim.respondentResponsePcqId = pcqId;
  await saveDraftClaim(generateRedisKey(appRequest), claim, false, appRequest.session?.user?.id);
};
