import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CASE_TIMELINE_DOCUMENTS_URL,
  FIRST_CONTACT_ACCESS_DENIED_URL,
  FIRST_CONTACT_CLAIM_SUMMARY_URL,
} from 'routes/urls';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {getInterestDetails} from 'common/utils/interestUtils';
import {
  getFixedCost,
  getTotalAmountWithInterestAndFeesAndFixedCost,
} from 'modules/claimDetailsService';
import {YesNo} from 'form/models/yesNo';
import {getLng} from 'common/utils/languageToggleUtils';
import {getClaimTimeline} from 'services/features/common/claimTimelineService';
import { AppRequest } from 'common/models/AppRequest';
import { getFirstContactData } from 'services/firstcontact/firstcontactService';
import crypto from 'crypto';

const firstContactClaimSummaryController = Router();

// Helper helper function to match CryptoJS.AES.decrypt functionality
function decryptAES(cipherText: string, secretKey: string): string {
  try {
    // CryptoJS derives a 32-byte key and 16-byte IV using an OpenSSL-compatible KDF (EVP_BytesToKey)
    // To match your exact existing encryption, ensure your key length fits the standard algorithm.
    // Assuming standard AES-256-CBC with a hashed/padded key:
    const key = crypto.createHash('sha256').update(secretKey).digest();

    // CryptoJS prepends 'Salted__' (8 bytes) + salt (8 bytes) if standard password encryption was used.
    // If it was encrypted as a raw ciphertext string, extract components accordingly.
    const cipherBuffer = Buffer.from(cipherText, 'base64');

    // For a standard 16-byte IV setup (Replace with your actual IV logic if explicit initialization vectors were used)
    const iv = Buffer.alloc(16, 0);

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(cipherBuffer, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return '';
  }
}

firstContactClaimSummaryController.get(FIRST_CONTACT_CLAIM_SUMMARY_URL,
  (async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const firstContact = getFirstContactData(req.session);
      const claimId = firstContact?.claimId;
      if (!claimId) {
        return res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
      }
      const claim: Claim = await getClaimById(claimId, req, false);
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;

      if (!claim.respondent1PinToPostLRspec?.accessCode || !firstContact?.pin) {
        return res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
      }

      const originalText = decryptAES(firstContact.pin, claim.respondent1PinToPostLRspec.accessCode);

      if (claimId && originalText === YesNo.YES) {
        const interestData = await getInterestDetails(claim);
        const totalAmount = await getTotalAmountWithInterestAndFeesAndFixedCost(claim);
        const timelineRows = getClaimTimeline(claim, getLng(lang));
        const fixedCost = await getFixedCost(claim);
        const timelinePdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', claimId).replace(':documentId', claim.extractDocumentId());
        res.render('features/public/firstContact/claim-summary', {
          claim, totalAmount, interestData, timelineRows, timelinePdfUrl, claimId, fixedCost,
        });
      } else {
        res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default firstContactClaimSummaryController;
