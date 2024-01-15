import {NextFunction, Request, Response} from 'express';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIMANT_TASK_LIST_URL} from '../urls';
import {AppRequest} from 'common/models/AppRequest';

export const claimLanguagePreferenceGuard = (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const id = req.params.id;
      if (id == undefined) {
        next();
        return;
      }
      const caseData = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
      if (caseData.claimantBilingualLanguagePreference) {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIMANT_TASK_LIST_URL));
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  })();
};
