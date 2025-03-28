import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {getClaimById} from 'modules/utilityService';
import {BACK_URL, QM_CYA} from 'routes/urls';
import {getCancelUrl, saveQueryManagement} from 'services/features/queryManagement/queryManagementService';
import {
  createApplicantCitizenQuery,
  createRespondentCitizenQuery,
  getSummarySections,
} from 'services/features/queryManagement/createQueryCheckYourAnswerService.';

const viewPath = 'features/queryManagement/createQueryCheckYourAnswer.njk';
const createQueryCheckYourAnswerController = Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

createQueryCheckYourAnswerController.get(QM_CYA, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claim = await getClaimById(req.params.id, req, true);
    const backLinkUrl = BACK_URL;
    const headerTitle = 'send a message';
    const cancelUrl = getCancelUrl(req.params.id);
    res.render(viewPath, {headerTitle, summaryRows: getSummarySections(req.params.id, claim), backLinkUrl, cancelUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

createQueryCheckYourAnswerController.post(QM_CYA, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const updatedClaim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (claim.isClaimant()) {
      await createApplicantCitizenQuery(claim, updatedClaim, req);
    } else {
      await createRespondentCitizenQuery(claim, updatedClaim, req);
    }
    await saveQueryManagement(claimId, null, 'createQuery', req);
    res.status(200).send('Request was successful');
  } catch (error) {
    next(error);
  }
});
export default createQueryCheckYourAnswerController;
