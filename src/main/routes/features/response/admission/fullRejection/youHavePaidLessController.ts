import * as express from 'express';
import {CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, CLAIM_TASK_LIST_URL} from '../../../../urls';
import {getClaimantName} from '../../../../../services/features/response/rejectAllOfClaimService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const youHavePaidLessController = express.Router();
const youHavePaidLessViewPath = 'features/response/admission/fullRejection/you-have-paid-less';

youHavePaidLessController.get(CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, async (req, res) => {
  try {
    const claimantName = await getClaimantName(req.params.id);
    res.render(youHavePaidLessViewPath, {claimantName});
  }
  catch (error) {
    res.status(500).send({error: error.message});
  }
});

youHavePaidLessController.post(CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, (req, res) => {
  res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
});

export default youHavePaidLessController;
