import {NextFunction, Request, Response,RequestHandler, Router} from 'express';
import {CP_EVIDENCE_UPLOAD_SUBMISSION_URL, DEFENDANT_SUMMARY_URL, UPLOAD_YOUR_DOCUMENTS_URL} from '../../urls';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {caseNumberPrettify} from 'common/utils/stringUtils';

const uploadDocumentsViewPath = 'features/caseProgression/documents-uploaded';
const documentsUploadedController = Router();

documentsUploadedController.get(CP_EVIDENCE_UPLOAD_SUBMISSION_URL, (async (req:Request, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim: Claim = await getCaseDataFromStore(claimId);
    const uploadYourDocumentsUrl = UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claim.id);
    const documentsTabUrl = DEFENDANT_SUMMARY_URL.replace(':id', claim.id)+'#documents';
    const caseNumber = caseNumberPrettify(claimId);
    res.render(uploadDocumentsViewPath, {claim, caseNumber, uploadYourDocumentsUrl, documentsTabUrl});
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default documentsUploadedController;
