import {NextFunction, Router, Response, Request} from 'express';
import {CLAIM_INTEREST_CONTINUE_CLAIMING_URL, CLAIM_INTEREST_TOTAL_URL} from '../../../../routes/urls';
import {AppRequest} from '../../../../common/models/AppRequest';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {TotalInterest} from '../../../../common/form/models/interest/totalInterest';
import {getInterest, saveInterest} from '../../../../services/features/claim/interest/interestService';
import {app} from 'app';

const claimTotalInterestController = Router();
const claimTotalInterestViewPath = 'features/claim/interest/total-claim-interest';
const propertyName = 'totalInterest';

claimTotalInterestController.get(CLAIM_INTEREST_TOTAL_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const interest = await getInterest(app.locals.user?.id);
    res.render(claimTotalInterestViewPath, {
      form: new GenericForm(new TotalInterest(interest?.totalInterest?.amount.toString(), interest?.totalInterest?.reason)),
    });
  } catch (error) {
    next(error);
  }
});

claimTotalInterestController.post(CLAIM_INTEREST_TOTAL_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const form = new GenericForm(new TotalInterest(req.body.amount, req.body.reason));
    form.validateSync();

    if (form.hasErrors()) {
      res.render(claimTotalInterestViewPath, {form});
    } else {
      await saveInterest(app.locals.user?.id, form.model, propertyName);
      res.redirect(CLAIM_INTEREST_CONTINUE_CLAIMING_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default claimTotalInterestController;
