import {NextFunction, Request, Response, Router} from 'express';
import {AppRequest} from '../../../../common/models/AppRequest';
import {GenericForm} from '../../../../common/form/models/genericForm';

import {CLAIM_INTEREST_END_DATE_URL, CLAIM_INTEREST_START_DATE_URL} from '../../../urls';
import {InterestStartDate} from '../../../../common/form/models/interest/interestStartDate';
import {getInterest, saveInterest} from '../../../../services/features/claim/interest/interestService';

const interestStartDateController = Router();
const interestStartDateViewPath = 'features/claim/interest/interest-start-date';
const dqPropertyName = 'interestStartDate';

function renderView(form: GenericForm<InterestStartDate>, res: Response): void {
  res.render(interestStartDateViewPath, {form, today: new Date()});
}

interestStartDateController.get(CLAIM_INTEREST_START_DATE_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const interest = await getInterest(req.session?.user?.id);
    const interestStartDate = Object.assign(new InterestStartDate(), interest.interestStartDate);
    const form = new GenericForm(interestStartDate);

    renderView(form, res);
  } catch (error) {
    next(error);
  }
});

interestStartDateController.post(CLAIM_INTEREST_START_DATE_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const form = new GenericForm(new InterestStartDate(req.body.day, req.body.month, req.body.year, req.body.reason));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      const appRequest = <AppRequest>req;
      await saveInterest(appRequest.session?.user?.id, form.model, dqPropertyName);
      res.redirect(CLAIM_INTEREST_END_DATE_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default interestStartDateController;
