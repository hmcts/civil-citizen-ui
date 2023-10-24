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
import {generateRedisKey } from 'modules/draft-store/draftStoreService';
import {getDecisionOnClaimantProposedPlan} from 'services/features/claimantResponse/getDecisionOnClaimantProposedPlan';
import {AppRequest} from 'models/AppRequest';

const claimantSuggestedInstalmentsViewPath = 'features/claimantResponse/instalments-plan';
const claimantSuggestedInstalmentsController = Router();
const crParentName = 'suggestedPaymentIntention';
const crPropertyName = 'repaymentPlan';

function renderView(form: GenericForm<RepaymentPlanForm>, res: Response): void {
  res.render(claimantSuggestedInstalmentsViewPath, {form});
}

claimantSuggestedInstalmentsController.get(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,  (async (req, res, next: NextFunction) => {
  try {
    const claimantSuggestedInstalmentsPlan = await getClaimantSuggestedInstalmentsPlan(generateRedisKey(req as unknown as AppRequest));
    renderView(new GenericForm(claimantSuggestedInstalmentsPlan), res);
  } catch (error) {
    next(error);
  }
})as RequestHandler);

claimantSuggestedInstalmentsController.post(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claimantSuggestedInstalments = await getClaimantSuggestedInstalmentsForm(req);
      const claimId = req.params.id;
      const form = new GenericForm(claimantSuggestedInstalments);
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form, res);
      } else {
        await saveClaimantResponse(generateRedisKey(req as unknown as AppRequest), form.model, crPropertyName, crParentName);
        const redirectUrl = await getDecisionOnClaimantProposedPlan(<AppRequest> req, claimId);
        res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
      }
    } catch (error) {
      next(error);
    }
  })as RequestHandler);

export default claimantSuggestedInstalmentsController;
