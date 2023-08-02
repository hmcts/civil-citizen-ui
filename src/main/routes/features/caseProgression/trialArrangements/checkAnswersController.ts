import {NextFunction, Request, Response, Router} from 'express';
import {deleteDraftClaimFromStore, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {AppRequest} from 'common/models/AppRequest';
import {
  DEFENDANT_SUMMARY_URL,
  TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS,
  TRIAL_ARRANGEMENTS_HEARING_DURATION,
} from 'routes/urls';
import {getSummarySections} from 'services/features/caseProgression/trialArrangements/checkAnswersService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {submitClaim} from 'services/features/claim/submission/submitClaim';

const checkAnswersViewPath = 'features/caseProgression/trialArrangements/check-answers';
const trialCheckAnswersController = Router();

function renderView(res: Response, claim: Claim, claimId: string, lang: string) {
  const latestUpdatesUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
  const hearingDurationTrialArrangementsUrl = constructResponseUrlWithIdParams(claimId, TRIAL_ARRANGEMENTS_HEARING_DURATION);
  const summarySections = getSummarySections(claimId, claim, lang);
  res.render(checkAnswersViewPath, {summarySections, latestUpdatesUrl, hearingDurationTrialArrangementsUrl});
}

trialCheckAnswersController.get(TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS,
  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const claim = await getCaseDataFromStore(claimId);
      renderView(res, claim, claimId, lang);
    } catch (error) {
      next(error);
    }
  });

trialCheckAnswersController.post(TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS, async (req: Request | AppRequest, res: Response, next: NextFunction) => {
  try {
    //const userId = (<AppRequest>req).session?.user?.id;
    //const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    //const claim = await getCaseDataFromStore(userId);
    await submitClaim(<AppRequest>req);
    await deleteDraftClaimFromStore(req.params.id);
    res.redirect(constructResponseUrlWithIdParams(req.params.id, DEFENDANT_SUMMARY_URL));
  }catch (error) {
    next(error);
  }
});

export default trialCheckAnswersController;
