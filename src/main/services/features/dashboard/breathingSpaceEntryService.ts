import {AppRequest} from 'models/AppRequest';
import {Request} from 'express';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {BreathingSpaceTypeAndReference} from 'models/breathingSpace/breathingSpaceTypeAndReference';
import {Claim} from 'models/claim';

export const getBreathingSpaceTypeAndReferenceForm = (claim: Claim): BreathingSpaceTypeAndReference => {
  if (claim.breathingSpaceTypeAndReference) {
    return new BreathingSpaceTypeAndReference(
      claim.breathingSpaceTypeAndReference.type,
      claim.breathingSpaceTypeAndReference.reference,
    );
  }
  return new BreathingSpaceTypeAndReference();
};

export const saveBreathingSpaceTypeAndReference = async (
  req: Request,
  form: BreathingSpaceTypeAndReference,
): Promise<void> => {
  const redisKey = generateRedisKey(<AppRequest>req);
  const claim = await getCaseDataFromStore(redisKey);
  claim.breathingSpaceTypeAndReference = form;
  await saveDraftClaim(redisKey, claim);
};
