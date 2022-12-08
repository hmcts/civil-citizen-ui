import {NextFunction, Router} from 'express';
import {CLAIM_CONFIRMATION_URL} from '../../urls';
import {YesNo} from 'form/models/yesNo';
import {getClaimById} from 'modules/utilityService';

const claimSubmittedView = 'features/claim/claim-submitted';
const claimSubmittedController = Router();

claimSubmittedController.get(CLAIM_CONFIRMATION_URL, async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    if(!claim.isEmpty()) {
      const claimNumber = claimId;
      const defendantFullName = claim.getDefendantFullName();
      const defendantResponseLimit = claim.responseDeadline?.calculatedResponseDeadline;
      const helpWithFee = claim.claimDetails?.helpWithFees?.option == YesNo.YES;

      res.render(claimSubmittedView, {
        claimNumber, defendantFullName, defendantResponseLimit,
        helpWithFee,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default claimSubmittedController;
