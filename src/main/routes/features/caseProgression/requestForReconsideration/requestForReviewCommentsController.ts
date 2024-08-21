import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL,
  REQUEST_FOR_RECONSIDERATION_COMMENTS_URL, REQUEST_FOR_RECONSIDERATION_COMMENTS_CYA_URL,
} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {GenericForm} from 'form/models/genericForm';
import {RequestForReviewForm} from 'models/caseProgression/requestForReconsideration/requestForReviewForm';
import {
  getNameRequestForReconsideration,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewContent';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {
  getRequestForReviewCommentsForm,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewCommentsService';
import {
  RequestForReviewCommentsForm,
} from 'models/caseProgression/requestForReconsideration/requestForReviewCommentsForm';
import {
  getRequestForReviewCommentsContent,
  getButtonContent,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewCommentsContent';

const requestForReviewViewPath = 'features/caseProgression/requestForReconsideration/request-for-review.njk';
const requestForReviewCommentsController = Router();

requestForReviewCommentsController.get(REQUEST_FOR_RECONSIDERATION_COMMENTS_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const form = new GenericForm(getRequestForReviewCommentsForm(claim));
    renderView(res, claimId, claim, form);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

requestForReviewCommentsController.post(REQUEST_FOR_RECONSIDERATION_COMMENTS_URL,(async (req, res, next) => {
  try {
    const form = new GenericForm(new RequestForReviewCommentsForm(req.body.textArea));
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req,true);
    await form.validate();
    if (form.hasErrors()) {
      renderView(res, claimId, claim, form);
    } else {
      const dqPropertyName = getNameRequestForReconsideration(claim);
      await saveCaseProgression(req, form.model, dqPropertyName);

      res.redirect(constructResponseUrlWithIdParams(claimId, REQUEST_FOR_RECONSIDERATION_COMMENTS_CYA_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

function renderView(res: Response, claimId: string, claim: Claim, form: GenericForm<RequestForReviewForm>) {

  let dashboardUrl;
  if (claim.isClaimant()) {
    dashboardUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  } else {
    dashboardUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
  }
  const pageTitle = 'PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW_COMMENTS.MICRO_TEXT';
  res.render(requestForReviewViewPath, {
    form,
    requestForReviewContents: getRequestForReviewCommentsContent(claim, claimId),
    buttonContents: getButtonContent(claimId), dashboardUrl, pageTitle});
}
export default requestForReviewCommentsController;
