import * as express from 'express';
import {DQ_TRIED_TO_SETTLE_CLAIM_URL, EXPERT_GUIDANCE_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {
  getTriedToSettle,
  getTriedToSettleForm,
  saveTriedToSettle,
} from '../../../services/features/directionsQuestionnaire/triedToSettleService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';

const triedToSettleController = express.Router();

function renderView(form: GenericForm<GenericYesNo>, res: express.Response): void {
  const triedToSettleClaimForm = Object.assign(form);
  triedToSettleClaimForm.option = form.model.option;
  res.render('features/directionsQuestionnaire/tried-to-settle-claim', {form: triedToSettleClaimForm});
}

triedToSettleController.get(DQ_TRIED_TO_SETTLE_CLAIM_URL, async (req, res, next) => {
  try {
    renderView(new GenericForm(await getTriedToSettle(req.params.id)), res);
  } catch (error) {
    next(error);
  }
});

triedToSettleController.post(DQ_TRIED_TO_SETTLE_CLAIM_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const triedToSettle = getTriedToSettleForm(req.body.option);
    const form = new GenericForm(triedToSettle);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveTriedToSettle(claimId, triedToSettle);
      res.redirect(constructResponseUrlWithIdParams(claimId, EXPERT_GUIDANCE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default triedToSettleController;
