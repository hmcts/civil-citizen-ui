import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {RepaymentPlanForm} from 'common/form/models/repaymentPlan/repaymentPlanForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'common/form/models/genericForm';
import {
  CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,
} from 'routes/urls';
import {getFinancialDetails, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {
  getClaimantSuggestedInstalmentsForm,
  getClaimantSuggestedInstalmentsPlan,
} from 'services/features/claimantResponse/claimantSuggestedInstalmentsService';
import {generateRedisKey } from 'modules/draft-store/draftStoreService';
import {getDecisionOnClaimantProposedPlan} from 'services/features/claimantResponse/getDecisionOnClaimantProposedPlan';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';

const claimantSuggestedInstalmentsViewPath = 'features/claimantResponse/instalments-plan';
const claimantSuggestedInstalmentsController = Router();
const crParentName = 'suggestedPaymentIntention';
const crPropertyName = 'repaymentPlan';

function renderView(form: GenericForm<RepaymentPlanForm>, res: Response, req: Request, claim:Claim): void {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const financialDetails = getFinancialDetails(claim, lang);
  res.render(claimantSuggestedInstalmentsViewPath, {form, claim, financialDetails});
}

claimantSuggestedInstalmentsController.get(CLAIMANT_RESPONSE_PAYMENT_PLAN_URL,  (async (req, res, next: NextFunction) => {
  try {
    const claimantSuggestedInstalmentsPlan = await getClaimantSuggestedInstalmentsPlan(generateRedisKey(req as unknown as AppRequest));
    const claimId = req.params.id;
    const claim: Claim = await getClaimById(claimId, req, true);
    renderView(new GenericForm(claimantSuggestedInstalmentsPlan), res, req, claim);
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
        const claimId = req.params.id;
        const claim: Claim = await getClaimById(claimId, req, true);
        renderView(form, res, req, claim);
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
