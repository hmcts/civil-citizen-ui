import {NextFunction, Response, Router} from 'express';
import {CLAIM_CHECK_ANSWERS_URL, CLAIM_CONFIRMATION_URL} from '../../urls';
import {getSummarySections} from '../../../services/features/claim/checkAnswers/checkAnswersService';
import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {Claim} from '../../../common/models/claim';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {AppRequest} from '../../../common/models/AppRequest';
import {submitResponse} from '../../../services/features/response/submission/submitResponse';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const checkAnswersViewPath = 'features/claim/check-answers';
const claimCheckAnswersController = Router();

async function renderView(req: AppRequest, res: Response, claim: Claim, userId: string) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const claimFee = await civilServiceClient.getClaimAmountFee(claim.totalClaimAmount, req);
  const summarySections = getSummarySections(userId, claim, claimFee, lang);
  res.render(checkAnswersViewPath, {summarySections});
}

claimCheckAnswersController.get(CLAIM_CHECK_ANSWERS_URL,
  // AllResponseTasksCompletedGuard.apply(CLAIM_INCOMPLETE_SUBMISSION_URL), TODO implement guard
  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.session?.user?.id;
      const claim = await getCaseDataFromStore(userId);
      await renderView(req, res, claim, userId);
    } catch (error) {
      next(error);
    }
  });

claimCheckAnswersController.post(CLAIM_CHECK_ANSWERS_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    await submitResponse(<AppRequest>req);
    const userId = req.session?.user?.id;
    res.redirect(constructResponseUrlWithIdParams(userId, CLAIM_CONFIRMATION_URL));
  } catch (error) {
    next(error);
  }
});

export default claimCheckAnswersController;

