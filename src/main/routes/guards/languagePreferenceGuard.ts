import {NextFunction, Request, Response} from 'express';
import {getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {DASHBOARD_URL} from '../urls';

export const languagePreferenceGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseData = await getCaseDataFromStore(req.params.id);
    if (caseData.claimBilingualLanguagePreference) {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, DASHBOARD_URL));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};
