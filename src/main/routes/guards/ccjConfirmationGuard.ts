import {NextFunction, Request, Response} from 'express';
import {Claim} from '../../common/models/claim';
import {getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../common/utils/urlFormatter';
// import {RESPONSE_TASK_LIST_URL} from '../../routes/urls';

export const ccjConfirmationGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caseData: Claim = await getCaseDataFromStore(req.params.id);
    if (caseData.isCCJCompleted()) {
      next();
    } else {
      res.redirect(constructResponseUrlWithIdParams(req.params.id, 'test'));
    }
  } catch (error) {
    next(error);
  }
};
