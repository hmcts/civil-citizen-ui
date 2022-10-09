import * as express from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {CLAIMANT_INTEREST_RATE_URL,CLAIMANT_INTEREST_DATE_URL} from '../../../urls';
import {
  getInterestRate,
  saveIterestRate,
} from '../../../../services/features/claim/interest/claimantInterestRateService';
import {ClaimantInterestRate} from '../../../../common/form/models/claim/interest/claimantInterestRate';
import {AppRequest} from 'common/models/AppRequest';
import {SameRateInterestSelection, SameRateInterestType} from '../../../../common/form/models/claimDetails';

const interestRateController = express.Router();
const interestRateViewPath = 'features/claim/interest/claimant-interest-rate';

function renderView(form: GenericForm<ClaimantInterestRate>, res: express.Response): void {
  res.render(interestRateViewPath, {form});
}

interestRateController.get(CLAIMANT_INTEREST_RATE_URL, async (req:AppRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const claimId = req.session.user?.id;
    const form: ClaimantInterestRate = await getInterestRate(claimId);
    renderView(new GenericForm<ClaimantInterestRate>(form),res);
  } catch (error) {
    next(error);
  }
});

interestRateController.post(CLAIMANT_INTEREST_RATE_URL,
  async (req: AppRequest | express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const claimId = (<AppRequest>req).session.user?.id;
      const sameRateInterestSelection: SameRateInterestSelection = {
        sameRateInterestType: req.body.option,
        differentRate: req.body.option === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE ? req.body.rate : '',
        reason: req.body.option === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE ? req.body.reason : '',
      };
      const form: GenericForm<ClaimantInterestRate> = new GenericForm(new ClaimantInterestRate(sameRateInterestSelection.sameRateInterestType,sameRateInterestSelection.differentRate,sameRateInterestSelection.reason));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await saveIterestRate(claimId,form.model);
        res.redirect(CLAIMANT_INTEREST_DATE_URL);
      }
    } catch (error) {
      next(error);
    }
  });

export default interestRateController;
