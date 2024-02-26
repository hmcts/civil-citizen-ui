import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  CLAIM_INTEREST_END_DATE_URL,
  CLAIM_HELP_WITH_FEES_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {InterestEndDate} from 'form/models/interest/interestEndDate';
import {InterestEndDateType} from 'form/models/claimDetails';
import {AppRequest} from 'models/AppRequest';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';

const interestEndDateController = Router();
const interestEndDateViewPath = 'features/claim/interest/interest-end-date';
const dqPropertyName = 'interestEndDate';

function renderView(form: GenericForm<InterestEndDate>, res: Response): void {
  res.render(interestEndDateViewPath, {form});
}

interestEndDateController.get(CLAIM_INTEREST_END_DATE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.session?.user?.id;
    const interest = await getInterest(claimId);
    const interestEndDate =  new InterestEndDate(interest.interestEndDate);
    const form = new GenericForm(interestEndDate);

    renderView(form, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

interestEndDateController.post(CLAIM_INTEREST_END_DATE_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const form = new GenericForm(new InterestEndDate(req.body.option as InterestEndDateType));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      const appRequest = <AppRequest>req;
      await saveInterest(appRequest.session?.user?.id, form.model.option, dqPropertyName);
      res.redirect(CLAIM_HELP_WITH_FEES_URL);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default interestEndDateController;
