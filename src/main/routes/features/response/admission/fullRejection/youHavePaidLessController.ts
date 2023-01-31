import {NextFunction, Router} from 'express';
import {CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, RESPONSE_TASK_LIST_URL} from '../../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {getCaseDataFromStore} from '../../../../../modules/draft-store/draftStoreService';

const youHavePaidLessController = Router();
const youHavePaidLessViewPath = 'features/response/admission/fullRejection/you-have-paid-less';

youHavePaidLessController.get(CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, async (req, res, next: NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    res.render(youHavePaidLessViewPath, {claimantName: claim.getClaimantFullName()});
  } catch (error) {
    next(error);
  }
});

youHavePaidLessController.post(CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, (req, res) => {
  res.redirect(constructResponseUrlWithIdParams(req.params.id, RESPONSE_TASK_LIST_URL));
});

export default youHavePaidLessController;
