import {isQueryManagementEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {NextFunction, Request, Response} from 'express';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {QM_START_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {CaseState} from 'form/models/claimDetails';

export const contactUsGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const isClaimOffLine = [CaseState.PENDING_CASE_ISSUED, CaseState.CASE_DISMISSED, CaseState.PROCEEDS_IN_HERITAGE_SYSTEM];
  const requestId = req.path.split('/').filter(Boolean)[1] || undefined; // get claim id
  if(requestId){
    req.params.id = requestId;
    const redisKey = generateRedisKey(<AppRequest>req);
    const caseData: Claim = await getCaseDataFromStore(redisKey);
    const isQMFlagEnabled = await isQueryManagementEnabled(caseData?.submittedDate);

    if(isQMFlagEnabled && !isClaimOffLine.includes(caseData.ccdState)) {
      res.locals.showCreateQuery = true;
      res.locals.isQMFlagEnabled = true;
      res.locals.disableSendMessage = true;
      res.locals.qmStartUrl = constructResponseUrlWithIdParams(req.params.id, QM_START_URL)+'?linkFrom=start';
    }
  }
  next();
};

