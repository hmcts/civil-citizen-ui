import {NextFunction, Request, Response, Router} from 'express';
import {RepaymentPlanForm} from 'common/form/models/repaymentPlan/repaymentPlanForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'common/form/models/genericForm';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {CLAIMANT_RESPONSE_PAYMENT_PLAN_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';

const claimantSuggestedInstalmentsViewPath = 'features/claimantResponse/instalments-plan';
const claimantSuggestedInstalmentsController = Router();
const crParentName = 'paymentIntention';
const crPropertyName = 'repaymentPlan';

function renderView(form: GenericForm<RepaymentPlanForm>, res: Response): void {
  res.render(claimantSuggestedInstalmentsViewPath, {form});
}

claimantSuggestedInstalmentsController.get(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,  async (req, res, next: NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    const claimantSuggestedInstalments = claim.claimantResponse?.paymentIntention?.repaymentPlan;
    const firstRepaymentDate = new Date(claimantSuggestedInstalments?.firstRepaymentDate);
    const form = claimantSuggestedInstalments ? new RepaymentPlanForm(
      claim.totalClaimAmount,
      claimantSuggestedInstalments.paymentAmount,
      claimantSuggestedInstalments.repaymentFrequency,
      firstRepaymentDate.getFullYear().toString(),
      (firstRepaymentDate.getMonth() + 1).toString(),
      firstRepaymentDate.getDate().toString(),
    ) : new RepaymentPlanForm(claim.totalClaimAmount);
    renderView(new GenericForm(form), res);
  } catch (error) {
    next(error);
  }
});

claimantSuggestedInstalmentsController.post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const claim = await getCaseDataFromStore(claimId);
      const claimantSuggestedInstalments = new RepaymentPlanForm(
        claim.totalClaimAmount,
        req.body.paymentAmount,
        req.body.repaymentFrequency,
        req.body.year,
        req.body.month,
        req.body.day,
      );
      const form: GenericForm<RepaymentPlanForm> = new GenericForm(claimantSuggestedInstalments);
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        // TODO : trigger court calculator when it's developed and update redirection url with the result of it
        await saveClaimantResponse(claimId, form.model, crPropertyName, crParentName);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIMANT_RESPONSE_TASK_LIST_URL));
      }
    } catch (error) {
      next(error);
    }
  });

export default claimantSuggestedInstalmentsController;
