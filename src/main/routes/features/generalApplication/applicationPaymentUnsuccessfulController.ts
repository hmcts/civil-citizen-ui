import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_URL,
  GA_PAYMENT_UNSUCCESSFUL_URL,
} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const applicationPaymentUnsuccessfulViewPath = 'features/generalApplication/application-payment-unsuccessful';
const applicationPaymentUnsuccessfulController: Router = Router();

applicationPaymentUnsuccessfulController.get(GA_PAYMENT_UNSUCCESSFUL_URL, (req, res, next: NextFunction) => {
  (async () => {
    try {
      const claimId = req.params.id;
      const cancelUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_URL);
      res.render(applicationPaymentUnsuccessfulViewPath, {cancelUrl});
    } catch (error) {
      next(error);
    }
  })();
});

applicationPaymentUnsuccessfulController.post(GA_PAYMENT_UNSUCCESSFUL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    res.redirect(GA_PAYMENT_UNSUCCESSFUL_URL);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default applicationPaymentUnsuccessfulController;
