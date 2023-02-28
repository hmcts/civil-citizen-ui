import {NextFunction, Request, Response, Router} from 'express';
import {RepaymentPlanForm} from 'common/form/models/repaymentPlan/repaymentPlanForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'common/form/models/genericForm';
import {
  CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {
  getClaimantSuggestedInstalmentsForm,
  getClaimantSuggestedInstalmentsPlan,
} from 'services/features/claimantResponse/claimantSuggestedInstalmentsService';

const claimantSuggestedInstalmentsViewPath = 'features/claimantResponse/instalments-plan';
const claimantSuggestedInstalmentsController = Router();
const crParentName = 'suggestedPaymentIntention';
const crPropertyName = 'repaymentPlan';

function renderView(form: GenericForm<RepaymentPlanForm>, res: Response): void {
  res.render(claimantSuggestedInstalmentsViewPath, {form});
}

claimantSuggestedInstalmentsController.get(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,  async (req, res, next: NextFunction) => {
  try {
    const claimantSuggestedInstalmentsPlan = await getClaimantSuggestedInstalmentsPlan(req.params.id);
    renderView(new GenericForm(claimantSuggestedInstalmentsPlan), res);
  } catch (error) {
    next(error);
  }
});

claimantSuggestedInstalmentsController.post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const claimantSuggestedInstalments = await getClaimantSuggestedInstalmentsForm(claimId, req);
      const form = new GenericForm(claimantSuggestedInstalments);
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
