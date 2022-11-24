import {NextFunction, Router} from 'express';
import {CASE_DOCUMENT_DOWNLOAD_URL, CLAIM_SUBMITTED_URL} from '../../urls';
import {getClaimById} from 'modules/utilityService';
import {DocumentUri} from 'models/document/documentType';
import {YesNo} from 'form/models/yesNo';

const claimSubmittedView = 'features/claim/claim-submitted';
const claimSubmittedController = Router();

claimSubmittedController.get(CLAIM_SUBMITTED_URL, async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    if(!claim.isEmpty()) {
      const claimNumber = claim.legacyCaseReference;
      const downloadHref = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentType', DocumentUri.SEALED_CLAIM);
      const defendantFullName = claim.getDefendantFullName();
      const defendantResponseLimit = claim.responseDeadline?.calculatedResponseDeadline;
      const helpWithFee = claim.claimDetails?.helpWithFees?.option == YesNo.YES;

      res.render(claimSubmittedView, {
        claimNumber, downloadHref, defendantFullName, defendantResponseLimit,
        helpWithFee,
      });
    }
  } catch (error) {
    next(error);
  }
});

export default claimSubmittedController;
