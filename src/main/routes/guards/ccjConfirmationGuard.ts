import {NextFunction, Request, Response} from 'express';
import {Claim} from '../../common/models/claim';
import {getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {DASHBOARD_CLAIMANT_URL} from '../../routes/urls';
import {CCJRequest} from 'common/models/claimantResponse/ccj/ccjRequest';

export const ccjConfirmationGuard = (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const caseData: Claim = await getCaseDataFromStore(req.params.id);
      const ccjRequest = Object.assign(new CCJRequest(), caseData.claimantResponse?.ccjRequest);
      if (ccjRequest.isCCJCompleted()) {
        next();
      } else {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, DASHBOARD_CLAIMANT_URL));
      }
    } catch (error) {
      next(error);
    }
  })();
};
