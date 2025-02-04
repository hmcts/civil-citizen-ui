import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CASE_TIMELINE_DOCUMENTS_URL,
  FIRST_CONTACT_ACCESS_DENIED_URL,
  FIRST_CONTACT_CLAIM_SUMMARY_URL,
} from 'routes/urls';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {getInterestDetails} from 'common/utils/interestUtils';
import {getTotalAmountWithInterestAndFees} from 'modules/claimDetailsService';
import {YesNo} from 'form/models/yesNo';
import {getLng} from 'common/utils/languageToggleUtils';
import {getClaimTimeline} from 'services/features/common/claimTimelineService';
import { AppRequest } from 'common/models/AppRequest';
import { getFirstContactData } from 'services/firstcontact/firstcontactService';

const CryptoJS = require('crypto-js');

const firstContactClaimSummaryController = Router();

firstContactClaimSummaryController.get(FIRST_CONTACT_CLAIM_SUMMARY_URL,
  (async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const firstContact = getFirstContactData(req.session);
      const claimId = firstContact?.claimId;
      if (!claimId) {
        return res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
      }
      const claim: Claim = await getClaimById(claimId, req);
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;

      if (!claim.respondent1PinToPostLRspec?.accessCode || !firstContact?.pin) {
        return res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
      }

      const bytes = CryptoJS.AES.decrypt(firstContact?.pin, claim.respondent1PinToPostLRspec?.accessCode);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      if (claimId && originalText === YesNo.YES) {
        const interestData = await getInterestDetails(claim, req);
        const totalAmount = getTotalAmountWithInterestAndFees(claim);
        const timelineRows = getClaimTimeline(claim, getLng(lang));
        const timelinePdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', claimId).replace(':documentId', claim.extractDocumentId());
        res.render('features/public/firstContact/claim-summary', {
          claim, totalAmount, interestData, timelineRows, timelinePdfUrl, claimId,
        });
      } else {
        res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default firstContactClaimSummaryController;
