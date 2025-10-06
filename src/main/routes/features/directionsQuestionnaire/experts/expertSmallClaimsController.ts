import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DQ_EXPERT_REPORT_DETAILS_URL,
  DQ_EXPERT_SMALL_CLAIMS_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveExpertRequiredValue} from 'services/features/directionsQuestionnaire/expertRequiredValueService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {getDirectionQuestionnaire} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';

const expertSmallClaimsController = Router();
const expertSmallClaimsViewPath = 'features/directionsQuestionnaire/experts/expert-small-claims';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('expertSmallClaimsController');

expertSmallClaimsController.get(DQ_EXPERT_SMALL_CLAIMS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    res.render(expertSmallClaimsViewPath, {pageTitle: 'PAGES.EXPERT_SMALL_CLAIMS.TITLE'});
  } catch (error) {
    logger.error(`Error when GET : expert small claims - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

expertSmallClaimsController.post(DQ_EXPERT_SMALL_CLAIMS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const expertRequiredValue = req.body.expertYes;
    const redirectUrl = req.body.expertYes ? DQ_EXPERT_REPORT_DETAILS_URL : DQ_GIVE_EVIDENCE_YOURSELF_URL;
    await saveExpertRequiredValue(generateRedisKey(<AppRequest>req), expertRequiredValue);
    res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
  } catch (error) {
    logger.error(`Error when POST : expert small claims - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

export default expertSmallClaimsController;
