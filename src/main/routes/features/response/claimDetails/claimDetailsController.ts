import {NextFunction, Request, Response, Router} from 'express';
import {
  CLAIM_DETAILS_URL,
  CASE_TIMELINE_DOCUMENTS_URL,
  CASE_DOCUMENT_DOWNLOAD_URL,
} from '../../../urls';
import {Claim} from 'common/models/claim';
import {getInterestDetails} from 'common/utils/interestUtils';
import {getTotalAmountWithInterestAndFees} from 'modules/claimDetailsService';
import {DocumentUri} from 'common/models/document/documentType';
import {getClaimById} from 'modules/utilityService';

const claimDetailsController = Router();

claimDetailsController.get(CLAIM_DETAILS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim: Claim = await getClaimById(req.params.id, req);
    const interestData = getInterestDetails(claim);
    const totalAmount = getTotalAmountWithInterestAndFees(claim);
    const timelinePdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', req.params.id);
    const sealedClaimPdfUrl = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', req.params.id).replace(':documentType', DocumentUri.SEALED_CLAIM);
    res.render('features/response/claimDetails/claim-details', {
      claim, totalAmount, interestData, timelinePdfUrl, sealedClaimPdfUrl,
    });
  } catch (error) {
    next(error);
  }
});

export default claimDetailsController;
