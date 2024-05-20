import {NextFunction, RequestHandler, Router} from 'express';
import {DEFENDANT_SUMMARY_URL, GA_RESPONSE_CONFIRMATION_URL} from 'routes/urls';

const submitGeneralApplicationConfirmationViewPath = 'features/generalApplication/response/application-response-confirmation';
const applicationResponseConfirmationController = Router();

applicationResponseConfirmationController.get(GA_RESPONSE_CONFIRMATION_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    res.render(submitGeneralApplicationConfirmationViewPath, {
      dashboardUrl : DEFENDANT_SUMMARY_URL.replace(':id', claimId),
    });
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default applicationResponseConfirmationController;
