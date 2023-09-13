import {NextFunction, RequestHandler, Response, Router} from 'express';
import {deleteDraftClaimFromStore, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {AppRequest} from 'common/models/AppRequest';
import {
  CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL,
  DEFENDANT_SUMMARY_URL,
  TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS,
  TRIAL_ARRANGEMENTS_HEARING_DURATION,
} from 'routes/urls';
import {
  getCaseInfoContents,
  getSummarySections,
} from 'services/features/caseProgression/trialArrangements/checkAnswersService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CCDTrialArrangementDefendent} from 'models/ccdResponse/ccdTrialArrangementsHearingRequirements';
import {
  translateDraftTrialArrangementsToCCD,
} from 'services/translation/caseProgression/trialArrangements/convertToCCDTrialArrangements';

const checkAnswersViewPath = 'features/caseProgression/trialArrangements/check-answers';
const trialCheckAnswersController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderView(res: Response, claim: Claim, claimId: string, lang: string) {
  const latestUpdatesUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
  const hearingDurationTrialArrangementsUrl = constructResponseUrlWithIdParams(claimId, TRIAL_ARRANGEMENTS_HEARING_DURATION);
  const caseInfoContents = getCaseInfoContents(claimId, claim, lang);
  const summarySections = getSummarySections(claimId, claim, lang);
  res.render(checkAnswersViewPath, {caseInfoContents, summarySections, latestUpdatesUrl, hearingDurationTrialArrangementsUrl});
}

trialCheckAnswersController.get(TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS,
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

trialCheckAnswersController.post(TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(claimId);
    const trialReadyCCD: CCDTrialArrangementDefendent = translateDraftTrialArrangementsToCCD(claim);
    await civilServiceClient.submitDefendantTrialArrangement(req.params.id, trialReadyCCD, req);
    await deleteDraftClaimFromStore(req.params.id);
    res.redirect(constructResponseUrlWithIdParams(req.params.id, CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL));
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default trialCheckAnswersController;
