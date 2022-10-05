import * as express from 'express';
import {
  CLAIM_INTEREST,
  CLAIM_INTEREST_TYPE,
  CLAIM_HELP_WITH_FEES,
} from '../../../routes/urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {YesNo} from '../../../common/form/models/yesNo';
import {
  getClaimInterest,
  getClaimInterestForm,
  saveClaimInterest,
} from '../../../services/features/claim/claimInterestService';
import {AppRequest} from '../../../common/models/AppRequest';

const claimInterestController = express.Router();
const claimInterestPath = 'features/claim/claim-interest';

function renderView(form: GenericForm<GenericYesNo>, res: express.Response): void {
  res.render(claimInterestPath, {form});
}

claimInterestController.get(CLAIM_INTEREST, async (req:AppRequest, res:express.Response, next: express.NextFunction) => {
  const caseId = req.session?.user?.id;

  try {
    renderView(new GenericForm(await getClaimInterest(caseId)), res);
  } catch (error) {
    next(error);
  }
});

claimInterestController.post(CLAIM_INTEREST, async (req: any, res: express.Response, next: express.NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const claimInterest = getClaimInterestForm(req.body.option);
    const form = new GenericForm(claimInterest);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveClaimInterest(caseId, form.model);
      (form.model.option === YesNo.YES) ?
        res.redirect(CLAIM_INTEREST_TYPE) :
        res.redirect(CLAIM_HELP_WITH_FEES);
    }
  } catch (error) {
    next(error);
  }
});

export default claimInterestController;
