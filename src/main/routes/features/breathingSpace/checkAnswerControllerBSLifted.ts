import {NextFunction, RequestHandler, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {getBreathingSpace} from 'services/features/breathingSpace/breathingSpaceService';
import {BreathingSpace} from 'models/breathingSpace';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getSummarySections} from 'services/features/breathingSpace/checkYourAnswer/checkYourAnswerServiceForBreathingSpaceLifted';
import {submitBreathingSpaceLifted} from 'services/features/breathingSpace/submission/submitBreathingSpaceLifted';
import {BREATHING_SPACE_RESPITE_LIFTED_CHECK_ANSWER_URL, DASHBOARD_CLAIMANT_URL} from 'routes/urls';

const checkAnswersViewPath = 'features/breathingSpace/check-answer-lift-breathing-space';
const breathingSpaceLiftedCheckAnswersController = Router();

function renderView(req: AppRequest, res: Response, breathingSpace: BreathingSpace, userId: string) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const summarySections = getSummarySections(userId, breathingSpace, lang);
  res.render(checkAnswersViewPath, {summarySections: summarySections?.summaryList?.rows});
}

breathingSpaceLiftedCheckAnswersController.get(BREATHING_SPACE_RESPITE_LIFTED_CHECK_ANSWER_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const breathingSpace = await getBreathingSpace(generateRedisKey(req as unknown as AppRequest));
    renderView(req, res, breathingSpace, claimId);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

breathingSpaceLiftedCheckAnswersController.post(BREATHING_SPACE_RESPITE_LIFTED_CHECK_ANSWER_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    await submitBreathingSpaceLifted(<AppRequest>req);
    await deleteDraftClaimFromStore(generateRedisKey(req as unknown as AppRequest));
    res.redirect(constructResponseUrlWithIdParams(req.params.id, DASHBOARD_CLAIMANT_URL));
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default breathingSpaceLiftedCheckAnswersController;
