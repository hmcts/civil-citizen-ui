import {NextFunction, Request, Response, Router} from 'express';
import {
  CASE_DOCUMENT_DOWNLOAD_URL,
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
import {DocumentType} from 'models/document/documentType';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';

const ocmcBaseUrl = config.get<string>('services.cmc.url');

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
        const timelinePdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', claimId);
        const sealedClaimPdfUrl = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SEALED_CLAIM));
        const privacyPolicyUrl = `${ocmcBaseUrl}/privacy-policy`;
        res.render('features/public/firstContact/claim-summary', {
          claim, totalAmount, interestData,timelinePdfUrl,sealedClaimPdfUrl, privacyPolicyUrl, claimId,
        });
      } else {
        res.redirect(FIRST_CONTACT_ACCESS_DENIED_URL);
      }
    } catch (error) {
      next(error);
    }
  });

export default firstContactClaimSummaryController;
