import { NextFunction,Request, Response } from 'express';
import { constructResponseUrlWithIdParams } from '../../common/utils/urlFormatter';
import { DASHBOARD_CLAIMANT_URL } from '../../routes/urls';
import { getClaimById } from 'modules/utilityService';
import {deleteDraftClaimFromStore, generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { AppRequest } from 'common/models/AppRequest';
import { Claim } from 'common/models/claim';

export const claimantIntentGuard = (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redisClaimId = generateRedisKey(req as AppRequest);
    const caseStoreData: Claim = await getCaseDataFromStore(redisClaimId, true);
      
    // Delete cache from redis if case state is not AWAITING_APPLICANT_INTENTION.
    // Giving a chance to reload data from ccd database.
    if(caseStoreData && !caseStoreData.isEmpty() && !caseStoreData.isClaimantIntentionPending()) {
      await deleteDraftClaimFromStore(redisClaimId);
    }
      
    const caseData = await getClaimById(req.params.id, req, true);
    if (caseData.isClaimantIntentionPending() || req.originalUrl.includes('claimant-response/confirmation')) {
      next();
    } else {
      res.redirect(
        constructResponseUrlWithIdParams(
          req.params.id,
          DASHBOARD_CLAIMANT_URL,
        ),
      );
    }
  } catch (error) {
    next(error);
  }
});
