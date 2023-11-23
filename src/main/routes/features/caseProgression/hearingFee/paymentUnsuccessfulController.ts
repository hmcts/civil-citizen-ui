import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
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
      const claimDashboardUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
      res.render(paymentUnsuccessfulViewPath, {
        claimNumber,
        claimDashboardUrl,
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
