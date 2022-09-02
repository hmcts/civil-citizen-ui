import * as express from 'express';
import {FIRST_CONTACT_ACCESS_DENIED_URL, FIRST_CONTACT_CLAIM_SUMMARY_URL} from '../../../../routes/urls';
import {Claim} from '../../../../common/models/claim';
import {getClaimById} from '../../../../modules/utilityService';
import {getInterestDetails} from '../../../../common/utils/interestUtils';
import {getTotalAmountWithInterestAndFees} from '../../../../modules/claimDetailsService';

const firstContactClaimSummaryController = express.Router();

firstContactClaimSummaryController.get(FIRST_CONTACT_CLAIM_SUMMARY_URL,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      console.log('cookie', req.cookies.firstContact);

      // TODO: get claimId from cookie
      const claimId = '1645882162449404';
      const claim: Claim = await getClaimById(claimId, req);
      const interestData = getInterestDetails(claim);
      const totalAmount = getTotalAmountWithInterestAndFees(claim);
      res.render('features/public/firstContact/claim-summary', {
        claim, totalAmount, interestData,
      });

      if (req.cookies.firstContact) {
        // check if claimId and pinVerified is set
      } else {
        // redirect to unauthorised
        res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
      }
    } catch (error) {
      next(error);
    }
  });

export default firstContactClaimSummaryController;
