import {NextFunction, Response} from 'express';
import {getDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {Claim} from 'models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIMANT_TASK_LIST_URL} from '../urls';
import {AppRequest} from 'common/models/AppRequest';

export const claimLanguagePreferenceGuard = (req: AppRequest, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const id = req.params.id;
      if (id == undefined) {
        next();
        return;
      }
      const draftResult = await getDraftClaim(req);
      const caseData = Object.assign(new Claim(), draftResult?.claimResponse?.case_data as unknown as Claim);
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
