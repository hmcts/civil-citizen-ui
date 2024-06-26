import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CLAIM_HELP_WITH_FEES_URL, CLAIM_INTEREST_HOW_MUCH_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'models/AppRequest';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {HowMuchContinueClaiming} from 'form/models/interest/howMuchContinueClaiming';
import { SameRateInterestType } from 'form/models/claimDetails';
import {toNumberOrUndefined} from 'common/utils/numberConverter';

const howMuchContinueClaimingController = Router();
const howMuchContinueClaimingPath = 'features/claim/interest/how-much-continue-claiming';

function renderView(form: GenericForm<HowMuchContinueClaiming>, res: Response): void {
  res.render(howMuchContinueClaimingPath, {form});
}

howMuchContinueClaimingController.get(CLAIM_INTEREST_HOW_MUCH_URL, (async (req:AppRequest, res:Response, next: NextFunction) => {
  const caseId = req.session?.user?.id;
  try {
    const interest = await getInterest(caseId);
    renderView(new GenericForm<HowMuchContinueClaiming>(interest.howMuchContinueClaiming), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

howMuchContinueClaimingController.post(CLAIM_INTEREST_HOW_MUCH_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  const howMuchContinueClaiming = 'howMuchContinueClaiming';
  try {
    const caseId = (<AppRequest>req).session?.user?.id;
    const dailyInterestAmount = req.body.option === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE ? toNumberOrUndefined(req.body.dailyInterestAmount) : null;
    const form: GenericForm<HowMuchContinueClaiming> = new GenericForm(new HowMuchContinueClaiming(req.body.option, dailyInterestAmount));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveInterest(caseId, form.model, howMuchContinueClaiming);
      res.redirect(CLAIM_HELP_WITH_FEES_URL);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default howMuchContinueClaimingController;
