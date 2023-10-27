import {NextFunction, RequestHandler, Router} from 'express';
import {CCJ_CONFIRMATION_URL} from '../../../urls';
import {generateRedisKey, getCaseDataFromStore} from '../../../../../main/modules/draft-store/draftStoreService';
import {ccjConfirmationGuard} from 'routes/guards/ccjConfirmationGuard';
import { AppRequest } from 'common/models/AppRequest';

const ccjConfirmationController = Router();

ccjConfirmationController.get(CCJ_CONFIRMATION_URL, ccjConfirmationGuard, (async (req, res, next: NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(generateRedisKey(req as unknown as AppRequest));
    const defendantName = claim.getDefendantFullName();
    res.render('features/claimantResponse/ccj/ccj-confirmation', {defendantName});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default ccjConfirmationController;
