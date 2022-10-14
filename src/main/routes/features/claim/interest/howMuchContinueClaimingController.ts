import {NextFunction, Request, Response, Router} from 'express';
import {CLAIM_HELP_WITH_FEES_URL, CLAIM_INTEREST_HOW_MUCH} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
//TODO: cleanup if not needed
/*
import {YesNo} from '../../../../common/form/models/yesNo';
import {
  getClaimInterest,
  getClaimInterestForm,
  saveClaimInterest,
} from '../../../../services/features/claim/interest/claimInterestService';

 */
import {AppRequest} from '../../../../common/models/AppRequest';
import {getInterest, saveInterest} from '../../../../services/features/claim/interest/interestService';
import {HowMuchContinueClaiming} from 'common/form/models/interest/howMuchContinueClaiming';
import {SameRateInterestSelection, SameRateInterestType} from 'common/form/models/claimDetails';

const howMuchContinueClaimingController = Router();
const howMuchContinueClaimingPath = 'features/claim/interest/how-much-continue-claiming';

function renderView(form: GenericForm<HowMuchContinueClaiming>, res: Response): void {
//function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(howMuchContinueClaimingPath, {form});
}

howMuchContinueClaimingController.get(CLAIM_INTEREST_HOW_MUCH, async (req:AppRequest, res:Response, next: NextFunction) => {
  const caseId = req.session?.user?.id;

  //TODO: cleanup if not needed
  /*
  try {
    renderView(new GenericForm(await getClaimInterest(caseId)), res);
  } catch (error) {
    next(error);
  }
   */

  try {
    const interest = await getInterest(caseId);
    renderView(new GenericForm<HowMuchContinueClaiming>(interest.howMuchContinueClaiming), res);
  } catch (error) {
    next(error);
  }
});

howMuchContinueClaimingController.post(CLAIM_INTEREST_HOW_MUCH, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    //TODO: cleanup if not needed
    /*
    const caseId = req.session?.user?.id;
    const claimInterest = getClaimInterestForm(req.body.option);
    const form = new GenericForm(claimInterest);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveClaimInterest(caseId, form.model.option as YesNo);
      res.redirect(CLAIM_HELP_WITH_FEES_URL);
    }
     */

    const caseId = (<AppRequest>req).session?.user?.id;
    //const body = req.body as Record<string, string>;
    const sameRateInterestSelection = await getHowMuchContinueClaimingForm(req.body.option, req.body.dailyInterestAmount);
    const form: GenericForm<HowMuchContinueClaiming> = new GenericForm(new HowMuchContinueClaiming(sameRateInterestSelection.sameRateInterestType, sameRateInterestSelection.differentRate));
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

//TODO: move to service when complete?
const getHowMuchContinueClaimingForm = async (option: SameRateInterestType, dailyInterestAmount: number | undefined): Promise<SameRateInterestSelection> => {
  return {
    sameRateInterestType: option,
    differentRate: option === SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE ? dailyInterestAmount : undefined,
  };
};

export default howMuchContinueClaimingController;
