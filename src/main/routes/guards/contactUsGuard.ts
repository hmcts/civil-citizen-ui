import {isQueryManagementEnabled} from '../../app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {NextFunction, Request, Response} from 'express';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {QM_START_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';

export const contactUsGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const requestId = req.path.split('/').filter(Boolean)[1] || undefined;
  if(requestId){
    req.params.id = requestId;
    const redisKey = generateRedisKey(<AppRequest>req);
    const caseData: Claim = await getCaseDataFromStore(redisKey);
    const isQMFlagEnabled = await isQueryManagementEnabled(caseData.submittedDate);

    res.locals.qmStartUrl = constructResponseUrlWithIdParams(req.params.id, QM_START_URL)+'?linkFrom=start';
    res.locals.isQMFlagEnabled = isQMFlagEnabled;
  }
  next();
};

