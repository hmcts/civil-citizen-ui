import {NextFunction, RequestHandler, Response, Router} from 'express';
import {deleteDraftClaimFromStore, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {AppRequest} from 'common/models/AppRequest';
import {
  REQUEST_FOR_RECONSIDERATION, REQUEST_FOR_RECONSIDERATION_CANCEL,
  REQUEST_FOR_RECONSIDERATION_CONFIRMATION,
  REQUEST_FOR_RECONSIDERATION_CYA,
} from 'routes/urls';
import {
  getSummarySections,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getCaseInfoContents} from 'services/features/caseProgression/requestForReconsideration/requestForReviewService';
import {
  translateDraftRequestForReconsiderationToCCD,
} from 'services/translation/caseProgression/requestForReconsideration/convertToCCDRequestForReconsideration';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const checkAnswersViewPath = 'features/caseProgression/requestForReconsideration/check-answers';
const requestForReconsiderationCheckAnswersController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderView(res: Response, claim: Claim, claimId: string, lang: string) {
  const caseInfoContents = getCaseInfoContents(claimId, claim);
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, REQUEST_FOR_RECONSIDERATION);
  const summarySections = getSummarySections(claimId, claim, lang);
  const cancelUrl = REQUEST_FOR_RECONSIDERATION_CANCEL
    .replace(':id', claimId)
    .replace(':propertyName', 'caseProgression');
  res.render(checkAnswersViewPath, {summarySections, caseInfoContents, backLinkUrl, cancelUrl});
}

requestForReconsiderationCheckAnswersController.get(REQUEST_FOR_RECONSIDERATION_CYA,
  (  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const claim = await getCaseDataFromStore(claimId);
      renderView(res, claim, claimId, lang);
    } catch (error) {
      next(error);
    }
  })as RequestHandler);

requestForReconsiderationCheckAnswersController.post(REQUEST_FOR_RECONSIDERATION_CYA, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(claimId);
    const requestForReconsiderationCCD = translateDraftRequestForReconsiderationToCCD(claim);
    await civilServiceClient.submitRequestForReconsideration(claimId, requestForReconsiderationCCD, req);
    await deleteDraftClaimFromStore(claimId);
    res.redirect(constructResponseUrlWithIdParams(claimId, REQUEST_FOR_RECONSIDERATION_CONFIRMATION));
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default requestForReconsiderationCheckAnswersController;
