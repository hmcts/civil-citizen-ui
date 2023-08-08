import {NextFunction, Request, Response} from 'express';
import {Claim} from '../../common/models/claim';
import {getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
import {DASHBOARD_CLAIMANT_URL} from '../../routes/urls';

export const ccjConfirmationGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseData: Claim = await getCaseDataFromStore(req.params.id);
    if (caseData.isCCJCompleted()) {
      return next();
    } else {
      return res.redirect(constructResponseUrlWithIdParams(req.params.id, DASHBOARD_CLAIMANT_URL));
    }
  } catch (error) {
    next(error);
  }
};
