import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL,
  REQUEST_FOR_RECONSIDERATION_URL, REQUEST_FOR_RECONSIDERATION_CYA_URL,
} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {GenericForm} from 'form/models/genericForm';
import {
  getRequestForReviewForm,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewService';
import {RequestForReviewForm} from 'models/caseProgression/requestForReconsideration/requestForReviewForm';
import {
  getButtonContent,
  getNameRequestForReconsideration,
  getRequestForReviewContent,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewContent';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';

const requestForReviewViewPath = 'features/caseProgression/requestForReconsideration/request-for-review.njk';
const requestForReviewController = Router();

requestForReviewController.get(REQUEST_FOR_RECONSIDERATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const form = new GenericForm(getRequestForReviewForm(claim));
    await renderView(res, claimId, claim, form);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

requestForReviewController.post(REQUEST_FOR_RECONSIDERATION_URL,(async (req, res, next) => {
  try {
    let textArea = req.body.textArea;
    if (textArea == null) {
      textArea = '';
    }
    const form = new GenericForm(new RequestForReviewForm(textArea));
    const claimId = req.params.id;
    const claim: Claim = await getClaimById(claimId, req,true);
    const dqPropertyName = getNameRequestForReconsideration(claim);
    await saveCaseProgression(req, form.model, dqPropertyName);
    res.redirect(constructResponseUrlWithIdParams(req.params.id, REQUEST_FOR_RECONSIDERATION_CYA_URL));
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
  const pageTitle = 'PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MICRO_TEXT';
  res.render(requestForReviewViewPath, {
    form,
    requestForReviewContents: getRequestForReviewContent(claim, claimId),
    buttonContents: getButtonContent(claimId), dashboardUrl, pageTitle});
}
export default requestForReviewController;
