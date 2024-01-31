import {NextFunction, Request, Response, Router} from 'express';
import {CASE_DOCUMENT_DOWNLOAD_URL, CASE_TIMELINE_DOCUMENTS_URL, CLAIM_DETAILS_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {getInterestDetails} from 'common/utils/interestUtils';
import {getTotalAmountWithInterestAndFees} from 'modules/claimDetailsService';
import {DocumentType} from 'models/document/documentType';
import {getClaimById} from 'modules/utilityService';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';

const claimDetailsController = Router();

claimDetailsController.get(CLAIM_DETAILS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim: Claim = await getClaimById(req.params.id, req, true);
    const interestData = getInterestDetails(claim);
    const totalAmount = getTotalAmountWithInterestAndFees(claim);
    const timelinePdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', req.params.id).replace(':documentId', claim.extractDocumentId());
    const sealedClaimPdfUrl = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', req.params.id).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SEALED_CLAIM));
    res.render('features/response/claimDetails/claim-details', {
      claim, totalAmount, interestData, timelinePdfUrl, sealedClaimPdfUrl,
    });
  } catch (error) {
    next(error);
  }
});

export default claimDetailsController;
