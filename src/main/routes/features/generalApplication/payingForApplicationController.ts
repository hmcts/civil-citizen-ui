import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {PAYING_FOR_APPLICATION_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {getCancelUrl, getDynamicHeaderForMultipleApplications} from 'services/features/generalApplication/generalApplicationService';

const payingForApplicationController = Router();
const viewPath = 'features/generalApplication/paying-for-application';
const backLinkUrl = 'test'; // TODO: add url

payingForApplicationController.get(PAYING_FOR_APPLICATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const applicationFee = 100; //TODO: get fee from https://tools.hmcts.net/jira/browse/CIV-9442
    const headerTitle = getDynamicHeaderForMultipleApplications(claim);
    res.render(viewPath, { applicationFee, cancelUrl, backLinkUrl, headerTitle});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

payingForApplicationController.post(PAYING_FOR_APPLICATION_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  res.redirect('test'); // TODO: add url
}) as RequestHandler);

export default payingForApplicationController;
