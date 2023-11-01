import {NextFunction, Router} from 'express';
import {CLAIM_CONFIRMATION_URL, CLAIM_FEE_URL} from '../../urls';
import {getClaimById} from 'modules/utilityService';
import {formatDateToFullDate} from 'common/utils/dateUtils';

const claimSubmittedView = 'features/claim/claim-submitted';
const claimSubmittedController = Router();

claimSubmittedController.get(CLAIM_CONFIRMATION_URL, async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const lang = req.query.lang? req.query.lang : req.cookies.lang;

    if(!claim.isEmpty()) {
      const claimNumber = claim.getFormattedCaseReferenceNumber(claimId);
      const defendantFullName = claim.getDefendantFullName();
      const defendantResponseLimit = formatDateToFullDate(claim.respondent1ResponseDeadline, lang);
      const helpWithFee = claim.hasHelpWithFees();
      const claimFeeUrl = CLAIM_FEE_URL.replace(':id', claimId);
      res.render(claimSubmittedView, {
        claimNumber,
        defendantFullName,
        defendantResponseLimit,
        helpWithFee,
        claimId,
        claimFeeUrl,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default claimSubmittedController;
