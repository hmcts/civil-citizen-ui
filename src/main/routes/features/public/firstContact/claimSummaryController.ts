import {NextFunction, Request, Response, Router} from 'express';
import {FIRST_CONTACT_ACCESS_DENIED_URL, FIRST_CONTACT_CLAIM_SUMMARY_URL} from '../../../../routes/urls';
import {Claim} from 'common/models/claim';
import {getClaimById} from 'modules/utilityService';
import {getInterestDetails} from 'common/utils/interestUtils';
import {getTotalAmountWithInterestAndFees} from 'modules/claimDetailsService';
import {YesNo} from 'common/form/models/yesNo';

const firstContactClaimSummaryController = Router();

firstContactClaimSummaryController.get(FIRST_CONTACT_CLAIM_SUMMARY_URL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookie = req.cookies['firstContact'];
      if (cookie?.claimId && cookie?.pinVerified === YesNo.YES) {
        const claimId = req.cookies.firstContact?.claimId;
        const claim: Claim = await getClaimById(claimId, req);
        const interestData = getInterestDetails(claim);
        const totalAmount = getTotalAmountWithInterestAndFees(claim);
        res.render('features/public/firstContact/claim-summary', {
          claim, totalAmount, interestData,
        });
      } else {
        res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
      }
    } catch (error) {
      next(error);
    }
  });

export default firstContactClaimSummaryController;
