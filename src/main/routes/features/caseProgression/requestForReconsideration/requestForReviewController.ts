import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL,
  REQUEST_FOR_RECONSIDERATION, REQUEST_FOR_RECONSIDERATION_CYA,
} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {GenericForm} from 'form/models/genericForm';
import {
  getRequestForReviewForm,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewService';
import {RequestForReviewForm} from 'models/caseProgression/requestForReconsideration/requestForReviewForm';
import {
  getNameRequestForReconsideration,
  getRequestForReviewContent,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewContent';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';

const requestForReviewViewPath = 'features/caseProgression/requestForReconsideration/request-for-review.njk';
const requestForReviewController = Router();

requestForReviewController.get(REQUEST_FOR_RECONSIDERATION, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    const form = new GenericForm(getRequestForReviewForm(claim));
    await renderView(res, claimId, claim, form);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

requestForReviewController.post(REQUEST_FOR_RECONSIDERATION,(async (req, res, next) => {
  try {
    const textArea = req.body.textArea;
    const form = new GenericForm(new RequestForReviewForm(textArea));
    await form.validate();
    const claimId = req.params.id;
    const claim: Claim = await getCaseDataFromStore(req.params.id);
    if (form.hasErrors()) {
      await renderView(res, claimId, claim, form);
    } else {
      const dqPropertyName = getNameRequestForReconsideration(claim);
      await saveCaseProgression(claimId, form.model, dqPropertyName);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, REQUEST_FOR_RECONSIDERATION_CYA));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

async function renderView(res: Response, claimId: string, claim: Claim, form: GenericForm<RequestForReviewForm>) {

  let dashboardUrl;
  if (claim.isClaimant()) {
    dashboardUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  } else {
    dashboardUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
  }
  res.render(requestForReviewViewPath, {form, requestForReviewContents: getRequestForReviewContent(claim), dashboardUrl});
}
export default requestForReviewController;
