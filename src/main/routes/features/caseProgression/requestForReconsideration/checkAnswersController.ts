import {NextFunction, RequestHandler, Response, Router} from 'express';
import {deleteDraftClaimFromStore, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {AppRequest} from 'common/models/AppRequest';
import {
  DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, REQUEST_FOR_RECONSIDERATION,
  REQUEST_FOR_RECONSIDERATION_CONFIRMATION,
  REQUEST_FOR_RECONSIDERATION_CYA,
} from 'routes/urls';
import {
  getSummarySections,
} from 'services/features/caseProgression/requestForReconsideration/requestForReviewService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getCaseInfoContents} from 'services/features/caseProgression/requestForReconsideration/requestForReviewService';
//import config from 'config';
//import {CivilServiceClient} from 'client/civilServiceClient';

const checkAnswersViewPath = 'features/caseProgression/requestForReconsideration/check-answers';
const requestForReconsiderationCheckAnswersController = Router();
//const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
//const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderView(res: Response, claim: Claim, claimId: string, lang: string) {
  let dashboardUrl;
  if (claim.isClaimant()) {
    dashboardUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  } else {
    dashboardUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
  }
  const caseInfoContents = getCaseInfoContents(claimId, claim);
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, REQUEST_FOR_RECONSIDERATION);
  const summarySections = getSummarySections(claimId, claim, lang);
  const cancelUrl = constructResponseUrlWithIdParams(claimId, dashboardUrl);
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
    //const claim = await getCaseDataFromStore(claimId);
    //const trialReadyCCD = translateDraftTrialArrangementsToCCD(claim);
    //await civilServiceClient.submitTrialArrangement(claimId, trialReadyCCD, req);
    await deleteDraftClaimFromStore(claimId);
    res.redirect(constructResponseUrlWithIdParams(claimId, REQUEST_FOR_RECONSIDERATION_CONFIRMATION));
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default requestForReconsiderationCheckAnswersController;
