import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL, HEARING_FEE_MAKE_PAYMENT_AGAIN_URL,
  PAY_HEARING_FEE_UNSUCCESSFUL_URL,
} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'common/models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const paymentUnsuccessfulViewPath = 'features/caseProgression/hearingFee/payment-unsuccessful';
const paymentUnsuccessfulController: Router = Router();

paymentUnsuccessfulController.get(PAY_HEARING_FEE_UNSUCCESSFUL_URL, (req, res, next: NextFunction) => {
  (async () => {
    try {
      const claimId = req.params.id;
      const claim = await getClaimById(claimId, req, true);
      const claimNumber = claim.getFormattedCaseReferenceNumber(claimId);
      const makePaymentAgainUrl = constructResponseUrlWithIdParams(claimId, HEARING_FEE_MAKE_PAYMENT_AGAIN_URL);
      res.render(paymentUnsuccessfulViewPath, {
        claimNumber,
        makePaymentAgainUrl,
      });
    } catch (error) {
      next(error);
    }
  })();
});

paymentUnsuccessfulController.post(PAY_HEARING_FEE_UNSUCCESSFUL_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    res.redirect(constructResponseUrlWithIdParams(req.params.id, DASHBOARD_CLAIMANT_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default paymentUnsuccessfulController;
