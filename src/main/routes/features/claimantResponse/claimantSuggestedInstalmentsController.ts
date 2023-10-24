import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {RepaymentPlanForm} from 'common/form/models/repaymentPlan/repaymentPlanForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'common/form/models/genericForm';
import {
  CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,
} from 'routes/urls';
import {saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {
  getClaimantSuggestedInstalmentsForm,
  getClaimantSuggestedInstalmentsPlan,
} from 'services/features/claimantResponse/claimantSuggestedInstalmentsService';
import {getCourtDecision} from 'services/features/claimantResponse/getCourtDecision';
import {AppRequest} from 'models/AppRequest';

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
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const claimantSuggestedInstalments = await getClaimantSuggestedInstalmentsForm(claimId, req);
      const form = new GenericForm(claimantSuggestedInstalments);
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await saveClaimantResponse(claimId, form.model, crPropertyName, crParentName);
        const redirectUrl = await getCourtDecision(<AppRequest> req, claimId);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, redirectUrl));
      }
    } catch (error) {
      next(error);
    }
  })as RequestHandler);

export default claimantSuggestedInstalmentsController;
