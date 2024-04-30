import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, PAYING_FOR_APPLICATION_URL} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {selectedApplicationType} from 'common/models/generalApplication/applicationType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const payingForApplicationController = Router();
const viewPath = 'features/generalApplication/paying-for-application';
const backLinkUrl = 'test'; // TODO: add url

payingForApplicationController.get(PAYING_FOR_APPLICATION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = claim.isClaimant() 
      ? constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL) 
      : constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
    const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];
    const applicationFee = 100; //TODO: get fee from https://tools.hmcts.net/jira/browse/CIV-9442
    res.render(viewPath, {applicationType, applicationFee, cancelUrl, backLinkUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

payingForApplicationController.post(PAYING_FOR_APPLICATION_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  res.redirect('test'); // TODO: add url
}) as RequestHandler);

export default payingForApplicationController;
