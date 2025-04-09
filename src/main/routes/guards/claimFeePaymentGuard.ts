import {NextFunction, RequestHandler, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIM_FEE_CHANGE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {checkIfClaimFeeHasChanged} from 'services/features/claim/amount/checkClaimFee';

export const claimFeePaymentGuard = (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    if (claim?.isDraftClaim() && await checkIfClaimFeeHasChanged(claimId, claim, req)) {
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIM_FEE_CHANGE_URL.replace(':id', claimId)));
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler;
