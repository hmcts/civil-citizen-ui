import {Request} from 'express';
import {isDraftClaimDatabaseEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {AppRequest} from 'common/models/AppRequest';
import {Claim} from 'common/models/claim';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';

export const stashClaimOnRequest = (req: Request, claim: Claim): void => {
  const appReq = <AppRequest>req;
  appReq.locals = appReq.locals ?? {env: '', lang: ''};
  appReq.locals.claim = claim;
};

export const getStashedClaimOrFromStore = async (req: Request, redisKey?: string): Promise<Claim> => {
  const appReq = <AppRequest>req;
  if (appReq.locals?.claim) {
    return appReq.locals.claim;
  }
  if (!redisKey && await isDraftClaimDatabaseEnabled()) {
    const caseId = getRouteParam(appReq, 'id');
    if (/^\d+$/.test(caseId)) {
      return getResponseClaimById(appReq, caseId);
    }
  }
  return getCaseDataFromStore(redisKey ?? generateRedisKey(appReq));
};
