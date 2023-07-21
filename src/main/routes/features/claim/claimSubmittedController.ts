import {NextFunction, Router} from 'express';
import {CASE_DOCUMENT_DOWNLOAD_URL, CLAIM_CONFIRMATION_URL, CLAIM_FEE_URL} from '../../urls';
import {getClaimById} from 'modules/utilityService';
import {DocumentType} from 'models/document/documentType';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';

const claimSubmittedView = 'features/claim/claim-submitted';
const claimSubmittedController = Router();

claimSubmittedController.get(CLAIM_CONFIRMATION_URL, async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    const lang = req.query.lang? req.query.lang : req.cookies.lang;

    if(!claim.isEmpty()) {
      const claimNumber = claim.legacyCaseReference;
      const downloadHref = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SEALED_CLAIM));
      const defendantFullName = claim.getDefendantFullName();
      const defendantResponseLimit = formatDateToFullDate(claim.respondent1ResponseDeadline, lang);
      const helpWithFee = claim.hasHelpWithFees();
      const claimFeeUrl = CLAIM_FEE_URL;
      res.render(claimSubmittedView, {
        claimNumber, defendantFullName, defendantResponseLimit,
        helpWithFee, downloadHref, claimFeeUrl,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default claimSubmittedController;
