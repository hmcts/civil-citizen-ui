import {NextFunction, Request, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {CLAIM_INTEREST_RATE_URL,CLAIM_INTEREST_DATE_URL} from '../../../urls';
import {
  getInterestRateForm,
} from '../../../../services/features/claim/interest/claimantInterestRateService';
import {ClaimantInterestRate} from '../../../../common/form/models/claim/interest/claimantInterestRate';
import {AppRequest} from 'common/models/AppRequest';
import {getInterest, saveInterest} from '../../../../services/features/claim/interest/interestService';

const interestRateController = Router();
const interestRateViewPath = 'features/claim/interest/claimant-interest-rate';
const propertyName = 'sameRateInterestSelection';

function renderView(form: GenericForm<ClaimantInterestRate>, res: Response): void {
  res.render(interestRateViewPath, {form});
}

interestRateController.get(CLAIM_INTEREST_RATE_URL, async (req:AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.session.user?.id;
  try {
    const interest = await getInterest(claimId);
    renderView(new GenericForm<ClaimantInterestRate>(interest.sameRateInterestSelection),res);
  } catch (error) {
    next(error);
  }
});

interestRateController.post(CLAIM_INTEREST_RATE_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  const claimId = (<AppRequest>req).session.user?.id;
  try {
    const sameRateInterestSelection = await getInterestRateForm(req.body.option,req.body.rate,req.body.reason);
    const form: GenericForm<ClaimantInterestRate> = new GenericForm(new ClaimantInterestRate(sameRateInterestSelection.sameRateInterestType,sameRateInterestSelection.differentRate,sameRateInterestSelection.reason));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveInterest(claimId,form.model, propertyName);
      res.redirect(CLAIM_INTEREST_DATE_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default interestRateController;
