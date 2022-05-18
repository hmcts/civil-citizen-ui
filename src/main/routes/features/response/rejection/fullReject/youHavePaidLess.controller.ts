import * as express from 'express';
import {CITIZEN_FULL_REJECTION_YOU_PAID_LESS, CLAIM_TASK_LIST_URL} from 'routes/urls';
import {getClaimantName} from '../../../../../modules/rejectAllOfClaimService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const youHavePaidLessController = express.Router();
const youHavePaidLessViewPath = 'features/response/rejection/fullReject/you-have-paid-less';

youHavePaidLessController.get(CITIZEN_FULL_REJECTION_YOU_PAID_LESS, async (req, res) => {
  try {
    const claimantName = await getClaimantName(req.params.id);
    res.render(youHavePaidLessViewPath, {claimantName});
  }
  catch (error) {
    res.status(500).send({error: error.message});
  }
});

youHavePaidLessController.post(CITIZEN_FULL_REJECTION_YOU_PAID_LESS, (req, res) => {
  res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL));
});

export default youHavePaidLessController;
