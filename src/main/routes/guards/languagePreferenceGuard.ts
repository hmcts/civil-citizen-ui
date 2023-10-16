import {NextFunction, Request, Response} from 'express';
import {generateRedisKey, getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {RESPONSE_TASK_LIST_URL} from '../urls';
import {AppRequest} from 'common/models/AppRequest';

export const languagePreferenceGuard = (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const caseData = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
      if (caseData.claimBilingualLanguagePreference) {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  })();
};
