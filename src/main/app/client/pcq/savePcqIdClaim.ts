import {
  generateRedisKey,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Request} from 'express';
import {AppRequest} from 'models/AppRequest';

export const savePcqIdClaim = async (pcqId: string, req: Request, claimId: string) => {
  const claim = await getClaimById(claimId, req,true);
  claim.pcqId = pcqId;
  await saveDraftClaim(generateRedisKey(<AppRequest>req), claim);
};
