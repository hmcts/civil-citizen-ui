import {NextFunction, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  PAY_HEARING_FEE_UNSUCCESSFUL_URL,
} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';

const paymentUnsuccessfulViewPath = 'features/caseProgression/hearingFee/payment-unsuccessful';
const paymentUnsuccessfulController: Router = Router();

paymentUnsuccessfulController.get(PAY_HEARING_FEE_UNSUCCESSFUL_URL, (req, res, next: NextFunction) => {
  (async () => {
    try {
      const claimId = req.params.id;
      const claim = await getClaimById(claimId, req, true);

      if (!claim.isEmpty()) {
        const claimNumber = claim.getFormattedCaseReferenceNumber(claimId);
        const claimDashboardUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
        res.render(paymentUnsuccessfulViewPath, {
          claimNumber,
          claimId,
          claimDashboardUrl,
        });
      }
    } catch (error) {
      next(error);
    }
  })();
});

export default paymentUnsuccessfulController;
