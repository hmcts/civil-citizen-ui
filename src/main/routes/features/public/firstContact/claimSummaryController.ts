import {NextFunction, Request, Response, Router} from 'express';
import {
  CASE_TIMELINE_DOCUMENTS_URL,
  FIRST_CONTACT_ACCESS_DENIED_URL,
  FIRST_CONTACT_CLAIM_SUMMARY_URL,
} from 'routes/urls';
import {Claim} from '../../../../common/models/claim';
import {getClaimById} from '../../../../modules/utilityService';
import {getInterestDetails} from '../../../../common/utils/interestUtils';
import {getTotalAmountWithInterestAndFees} from '../../../../modules/claimDetailsService';
import {YesNo} from '../../../../common/form/models/yesNo';
import config from 'config';

const CryptoJS = require('crypto-js');

const ocmcBaseUrl = config.get<string>('services.cmc.url');

const firstContactClaimSummaryController = Router();

firstContactClaimSummaryController.get(FIRST_CONTACT_CLAIM_SUMMARY_URL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookie = req.cookies['firstContact'];
      const claimId = req.cookies.firstContact?.claimId;
      const claim: Claim = await getClaimById(claimId, req);

      if (!claim.respondent1PinToPostLRspec?.accessCode || !cookie?.AdGfst2UUAB7szHPkzojWkbaaBHtEIXBETUQ) {
        return res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
      }

      const bytes  = CryptoJS.AES.decrypt(cookie?.AdGfst2UUAB7szHPkzojWkbaaBHtEIXBETUQ, claim.respondent1PinToPostLRspec?.accessCode);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      
      if (cookie?.claimId && originalText === YesNo.YES) {
        const interestData = getInterestDetails(claim);
        const totalAmount = getTotalAmountWithInterestAndFees(claim);
        const timelinePdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', claimId).replace(':documentId', claim.extractDocumentId());
        const privacyPolicyUrl = `${ocmcBaseUrl}/privacy-policy`;
        res.render('features/public/firstContact/claim-summary', {
          claim, totalAmount, interestData, timelinePdfUrl, privacyPolicyUrl, claimId,
        });
      } else {
        res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
      }
    } catch (error) {
      next(error);
    }
  });

export default firstContactClaimSummaryController;
