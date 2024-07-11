import {NextFunction, Router} from 'express';
import {GA_APPLY_HELP_WITH_FEE_SELECTION, GA_PAYMENT_UNSUCCESSFUL_URL} from 'routes/urls';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {getClaimById} from 'modules/utilityService';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';

const applicationPaymentUnsuccessfulViewPath = 'features/generalApplication/application-payment-unsuccessful';
const applicationPaymentUnsuccessfulController: Router = Router();

applicationPaymentUnsuccessfulController.get(GA_PAYMENT_UNSUCCESSFUL_URL, (req, res, next: NextFunction) => {
  (async () => {
    try {
      const claimId = req.params.id;
      const claim = await getClaimById(claimId, req, true);
      const cancelUrl = await getCancelUrl(claimId, claim);
      const makePaymentAgainUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEE_SELECTION);
      res.render(applicationPaymentUnsuccessfulViewPath, {cancelUrl, makePaymentAgainUrl});
    } catch (error) {
      next(error);
    }
  })();
});

export default applicationPaymentUnsuccessfulController;
