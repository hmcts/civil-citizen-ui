import {NextFunction, Request, Response, Router} from 'express';
import {CLAIM_HELP_WITH_FEES_URL, CLAIM_INTEREST_HOW_MUCH} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {AppRequest} from '../../../../common/models/AppRequest';
import {getInterest, saveInterest} from '../../../../services/features/claim/interest/interestService';
import {HowMuchContinueClaiming} from '../../../../common/form/models/interest/howMuchContinueClaiming';
import { toNumber } from 'lodash';
import { SameRateInterestType } from '../../../../common/form/models/claimDetails';

const howMuchContinueClaimingController = Router();
const howMuchContinueClaimingPath = 'features/claim/interest/how-much-continue-claiming';

function renderView(form: GenericForm<HowMuchContinueClaiming>, res: Response): void {
  res.render(howMuchContinueClaimingPath, {form});
}

howMuchContinueClaimingController.get(CLAIM_INTEREST_HOW_MUCH, async (req:AppRequest, res:Response, next: NextFunction) => {
  const caseId = req.session?.user?.id;

  try {
    const interest = await getInterest(caseId);
    renderView(new GenericForm<HowMuchContinueClaiming>(interest.howMuchContinueClaiming), res);
  } catch (error) {
    next(error);
  }
});

howMuchContinueClaimingController.post(CLAIM_INTEREST_HOW_MUCH, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {

    const caseId = (<AppRequest>req).session?.user?.id;
    const dailyInterestAmount = req.body.option === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE ? toNumber(req.body.dailyInterestAmount) : null;
    const form: GenericForm<HowMuchContinueClaiming> = new GenericForm(new HowMuchContinueClaiming(req.body.option, dailyInterestAmount));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveInterest(caseId, form.model, 'howMuchContinueClaiming');
      res.redirect(CLAIM_HELP_WITH_FEES_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default howMuchContinueClaimingController;
