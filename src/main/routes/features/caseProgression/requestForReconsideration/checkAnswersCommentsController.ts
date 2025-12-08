import {NextFunction, RequestHandler, Response, Router} from 'express';
import {deleteDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {AppRequest} from 'common/models/AppRequest';
import {
  REQUEST_FOR_RECONSIDERATION_CANCEL_URL,
  REQUEST_FOR_RECONSIDERATION_COMMENTS_CYA_URL,
  REQUEST_FOR_RECONSIDERATION_COMMENTS_URL, REQUEST_FOR_RECONSIDERATION_COMMENTS_CONFIRMATION_URL,
} from 'routes/urls';
import {
  getSummarySectionsComments,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  translateDraftRequestForReconsiderationToCCD,
} from 'services/translation/caseProgression/requestForReconsideration/convertToCCDRequestForReconsideration';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {
  getCommentsCYACaseInfoContents,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewCommentsService';
import {getClaimById} from 'modules/utilityService';

const checkAnswersViewPath = 'features/caseProgression/requestForReconsideration/check-answers';
const requestForReconsiderationCommentsCheckAnswersController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderView(res: Response, claim: Claim, claimId: string, lang: string) {
  const caseInfoContents = getCommentsCYACaseInfoContents(claimId, claim);
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, REQUEST_FOR_RECONSIDERATION_COMMENTS_URL);
  const summarySections = getSummarySectionsComments(claimId, claim, lang);
  const cancelUrl = REQUEST_FOR_RECONSIDERATION_CANCEL_URL
    .replace(':id', claimId)
    .replace(':propertyName', 'caseProgression');
  res.render(checkAnswersViewPath, {summarySections, caseInfoContents, backLinkUrl, cancelUrl});
}

requestForReconsiderationCommentsCheckAnswersController.get(REQUEST_FOR_RECONSIDERATION_COMMENTS_CYA_URL,
  (  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const claim = await getClaimById(claimId, req, true);

      renderView(res, claim, claimId, lang);
    } catch (error) {
      next(error);
    }
  })as RequestHandler);

requestForReconsiderationCommentsCheckAnswersController.post(REQUEST_FOR_RECONSIDERATION_COMMENTS_CYA_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const requestForReconsiderationCCD = translateDraftRequestForReconsiderationToCCD(claim);
    await civilServiceClient.submitRequestForReconsideration(claimId, requestForReconsiderationCCD, req);
    await deleteDraftClaim(req);
    res.redirect(constructResponseUrlWithIdParams(claimId, REQUEST_FOR_RECONSIDERATION_COMMENTS_CONFIRMATION_URL));
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default requestForReconsiderationCommentsCheckAnswersController;
