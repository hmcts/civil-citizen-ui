import {NextFunction, Router} from 'express';
import {CLAIM_CONFIRMATION_URL} from '../../urls';
import {getClaimById} from 'modules/utilityService';
import {formatDateToFullDate} from 'common/utils/dateUtils';

const claimSubmittedView = 'features/claim/claim-submitted';
const claimSubmittedController = Router();

claimSubmittedController.get(CLAIM_CONFIRMATION_URL, async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    const lang = req.query.lang? req.query.lang : req.cookies.lang;

    if(!claim.isEmpty()) {
      const claimNumber = claim.legacyCaseReference;
      const defendantFullName = claim.getDefendantFullName();
      const defendantResponseLimit = formatDateToFullDate(claim.respondent1ResponseDeadline, lang);
      const helpWithFee = claim.hasHelpWithFees();
      res.render(claimSubmittedView, {
        claimNumber,
        defendantFullName,
        defendantResponseLimit,
        helpWithFee,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default claimSubmittedController;
