import {NextFunction, Response, Router} from 'express';
import {
  CLAIM_HELP_WITH_FEES_URL,
  CLAIM_INTEREST_DATE_URL,
  CLAIM_INTEREST_START_DATE_URL,
} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {InterestClaimFromSelection} from '../../../../common/form/models/claim/interest/interestClaimFromSelection';
import {InterestClaimFromType} from '../../../../common/form/models/claimDetails';
import {AppRequest} from '../../../../common/models/AppRequest';
import {getInterest, saveInterest} from '../../../../services/features/claim/interest/interestService';
import {app} from '../../../../app';

const claimantInterestFromController = Router();
const claimantInterestFromViewPath = 'features/claim/interest/claimant-interest-from';
const propertyName = 'interestClaimFrom';

function renderView(form: GenericForm<InterestClaimFromSelection>, res: Response): void {
  res.render(claimantInterestFromViewPath, {form});
}

claimantInterestFromController.get(CLAIM_INTEREST_DATE_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = app.locals.user?.id;
  try {
    const interest = await getInterest(claimId);
    renderView(new GenericForm(new InterestClaimFromSelection(interest.interestClaimFrom)), res);
  } catch (error) {
    next(error);
  }
});

claimantInterestFromController.post(CLAIM_INTEREST_DATE_URL, async (req: any, res: Response, next: NextFunction) => {
  try {
    const claimId = app.locals.user?.id;
    const form: GenericForm<InterestClaimFromSelection> = new GenericForm(new InterestClaimFromSelection(req.body.option as InterestClaimFromType));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveInterest(claimId, form.model.option, propertyName);
      if (form.model.option === InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE) {
        res.redirect(CLAIM_HELP_WITH_FEES_URL);
      } else {
        res.redirect(CLAIM_INTEREST_START_DATE_URL);
      }

    }
  } catch (error) {
    next(error);
  }
});

export default claimantInterestFromController;
