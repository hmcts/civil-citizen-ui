import {NextFunction, Request, Response, Router} from 'express';
import {CLAIM_CHECK_ANSWERS_URL, CLAIM_CONFIRMATION_URL} from '../../urls';
import {getSummarySections,} from '../../../services/features/claim/checkAnswers/checkAnswersService';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {submitResponse} from '../../../services/features/response/submission/submitResponse';

const checkAnswersViewPath = 'features/claim/check-answers';
const claimCheckAnswersController = Router();

function renderView(req: Request, res: Response, claim: Claim) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const summarySections = getSummarySections(req.params.id, claim, lang);

  res.render(checkAnswersViewPath, {summarySections});
}

claimCheckAnswersController.get(CLAIM_CHECK_ANSWERS_URL,
  // AllResponseTasksCompletedGuard.apply(CLAIM_INCOMPLETE_SUBMISSION_URL), TODO implement guard
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claim = await getCaseDataFromStore(req.params.id);

      renderView(req, res, claim);
    } catch (error) {
      next(error);
    }
  });

claimCheckAnswersController.post(CLAIM_CHECK_ANSWERS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await submitResponse(<AppRequest>req);
    res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIM_CONFIRMATION_URL));
  } catch (error) {
    next(error);
  }
});

export default claimCheckAnswersController;

