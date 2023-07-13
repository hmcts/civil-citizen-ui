import {NextFunction, Request, Response} from 'express';
import {getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {RESPONSE_TASK_LIST_URL} from '../urls';

export const languagePreferenceGuard = (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const caseData = await getCaseDataFromStore(req.params.id);
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
