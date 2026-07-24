import {Request} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

export const stashClaimOnRequest = (req: Request, claim: Claim): void => {
  const appReq = <AppRequest>req;
  appReq.locals = appReq.locals ?? {env: '', lang: ''};
  appReq.locals.claim = claim;
};

export const getStashedClaimOrFromStore = async (req: Request, redisKey?: string, doNotThrowError = false): Promise<Claim> => {
  const appReq = <AppRequest>req;
  if (appReq.locals?.claim) {
    return appReq.locals.claim;
  }
  return getCaseDataFromStore(redisKey ?? generateRedisKey(appReq), doNotThrowError);
};
