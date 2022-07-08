import * as express from 'express';
import {CITIZEN_REJECT_ALL_CLAIM_URL, CLAIM_TASK_LIST_URL, SEND_RESPONSE_BY_EMAIL_URL} from '../../urls';
import {getClaimantName, getRejectAllOfClaim, saveRejectAllOfClaim} from '../../../services/features/response/rejectAllOfClaimService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {GenericForm} from '../../../common/form/models/genericForm';
import {RejectAllOfClaim} from '../../../common/form/models/rejectAllOfClaim';
import RejectAllOfClaimType from '../../../common/form/models/rejectAllOfClaimType';

const rejectAllOfClaimViewPath = 'features/response/reject-all-of-claim';
const rejectAllOfClaimController = express.Router();
let claimantName = '';

rejectAllOfClaimController.get(CITIZEN_REJECT_ALL_CLAIM_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const rejectAllOfClaim: RejectAllOfClaim = await getRejectAllOfClaim(req.params.id);
    claimantName = await getClaimantName(req.params.id);

    const form = new GenericForm(rejectAllOfClaim);
    res.render(rejectAllOfClaimViewPath, {
      form,
      rejectAllOfClaimType: RejectAllOfClaimType,
      claimantName: claimantName,
    });
  } catch (error) {
    next(error);
  }
});

rejectAllOfClaimController.post(CITIZEN_REJECT_ALL_CLAIM_URL, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.params.id;
    const rejectAllOfClaim = new RejectAllOfClaim(req.body.option);
    const form = new GenericForm(rejectAllOfClaim);
    form.validateSync();
    if (form.hasErrors()) {
      res.render(rejectAllOfClaimViewPath, {
        form,
        rejectAllOfClaimType: RejectAllOfClaimType,
        claimantName: claimantName,
      });
    } else {
      await saveRejectAllOfClaim(claimId, rejectAllOfClaim);
      if (req.body.option === RejectAllOfClaimType.COUNTER_CLAIM) {
        res.redirect(constructResponseUrlWithIdParams(claimId, SEND_RESPONSE_BY_EMAIL_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_TASK_LIST_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default rejectAllOfClaimController;
