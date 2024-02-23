import {NextFunction, Response, Router} from 'express';
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
import { AppRequest } from 'common/models/AppRequest';
import { getFirstContactData } from 'services/firstcontact/firstcontactService';

const CryptoJS = require('crypto-js');

const ocmcBaseUrl = config.get<string>('services.cmc.url');

const firstContactClaimSummaryController = Router();

firstContactClaimSummaryController.get(FIRST_CONTACT_CLAIM_SUMMARY_URL,
  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const firstContact = getFirstContactData(req.session);
      const claimId = firstContact?.claimId;
      const claim: Claim = await getClaimById(claimId, req);

      if (!claim.respondent1PinToPostLRspec?.accessCode || !firstContact?.pin) {
        return res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
      }

      const bytes = CryptoJS.AES.decrypt(firstContact?.pin, claim.respondent1PinToPostLRspec?.accessCode);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);

      if (claimId && originalText === YesNo.YES) {
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
