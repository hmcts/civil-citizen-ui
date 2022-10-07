import * as express from 'express';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';

import {CLAIM_INTEREST_END_DATE_URL, CLAIM_INTEREST_START_DATE_URL} from '../../urls';
import {InterestStartDate} from '../../../common/form/models/Interest/interestStartDate';
import {getInterest, saveInterest} from '../../../services/features/claim/Interest/interestService';

const interestStartDateController = express.Router();
const interestStartDateViewPath = 'features/directionsQuestionnaire/otherWitnesses/other-witnesses';
const dqPropertyName = 'interestStartDate';

function renderView(form: GenericForm<InterestStartDate>, res: express.Response): void {
  res.render(interestStartDateViewPath, {form});
}

interestStartDateController.get(CLAIM_INTEREST_START_DATE_URL, async (req, res, next) => {
  try {
    const interest = await getInterest(req.params.id);
    const interestStartDate = Object.assign(new InterestStartDate(), interest.interestStartDate);
    const form = new GenericForm(interestStartDate);

    renderView(form, res);
  } catch (error) {
    next(error);
  }
});

interestStartDateController.post(CLAIM_INTEREST_START_DATE_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(new InterestStartDate(req.body.day, req.body.month, req.body.year, req.body.reason));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveInterest(claimId, form.model, dqPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_INTEREST_END_DATE_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default interestStartDateController;
