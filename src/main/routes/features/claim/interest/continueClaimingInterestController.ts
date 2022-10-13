import * as express from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../../common/form/models/genericYesNo';
import {
  CLAIM_HELP_WITH_FEES_URL,
  CLAIM_INTEREST_CONTINUE_CLAIMING_URL,
  CLAIM_INTEREST_HOW_MUCH_URL,
} from '../../../../routes/urls';
import {AppRequest} from '../../../../common/models/AppRequest';
import {YesNo} from '../../../../common/form/models/yesNo';
import {
  getContinueClaimingInterest,
  getContinueClaimingInterestForm,
  saveContinueClaimingInterest,
} from '../../../../services/features/claim/interest/continueClaimingInterestService';

const continueClaimingInterestController = express.Router();
const continueClaimingInterestPath = 'features/claim/interest/continue-claiming-interest';

function renderView(form: GenericForm<GenericYesNo>, res: express.Response): void {
  res.render(continueClaimingInterestPath, {form});
}

continueClaimingInterestController.get(CLAIM_INTEREST_CONTINUE_CLAIMING_URL, async (req:AppRequest, res:express.Response, next: express.NextFunction) => {
  const caseId = req.session?.user?.id;

  try {
    renderView(new GenericForm(await getContinueClaimingInterest(caseId)), res);
  } catch (error) {
    next(error);
  }
});

continueClaimingInterestController.post(CLAIM_INTEREST_CONTINUE_CLAIMING_URL, async (req: any, res: express.Response, next: express.NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const continueClaimingInterest = getContinueClaimingInterestForm(req.body.option);
    const form = new GenericForm(continueClaimingInterest);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveContinueClaimingInterest(caseId, form.model.option as YesNo);
      (form.model.option === YesNo.YES) ?
        res.redirect(CLAIM_INTEREST_HOW_MUCH_URL) :
        res.redirect(CLAIM_HELP_WITH_FEES_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default continueClaimingInterestController;
