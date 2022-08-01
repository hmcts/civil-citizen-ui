import * as express from 'express';
import {CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, CLAIM_TASK_LIST_URL} from '../../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {getCaseDataFromStore} from '../../../../../modules/draft-store/draftStoreService';

const youHavePaidLessController = express.Router();
const youHavePaidLessViewPath = 'features/response/admission/fullRejection/you-have-paid-less';

youHavePaidLessController.get(CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, async (req, res, next: express.NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    res.render(youHavePaidLessViewPath, {claimantName: claim.getClaimantName()});
  }
  catch (error) {
    next(error);
  }
});

youHavePaidLessController.post(CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, (req, res) => {
  res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
});

export default youHavePaidLessController;
