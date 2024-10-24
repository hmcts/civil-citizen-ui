import {NextFunction, RequestHandler, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, GA_RESPONSE_CONFIRMATION_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';

const submitGeneralApplicationConfirmationViewPath = 'features/generalApplication/response/application-response-confirmation';
const applicationResponseConfirmationController = Router();

applicationResponseConfirmationController.get(GA_RESPONSE_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    let redirectUrl = constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
    if (claim.isClaimant()) {
      redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    }
    res.render(submitGeneralApplicationConfirmationViewPath, {
      dashboardUrl: redirectUrl,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default applicationResponseConfirmationController;
