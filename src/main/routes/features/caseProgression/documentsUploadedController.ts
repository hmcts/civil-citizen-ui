import {NextFunction, Request, Response,RequestHandler, Router} from 'express';
import {
  CP_EVIDENCE_UPLOAD_SUBMISSION_URL,
  EVIDENCE_UPLOAD_DOCUMENTS_URL,
  UPLOAD_YOUR_DOCUMENTS_URL,
} from '../../urls';
import {caseNumberPrettify} from 'common/utils/stringUtils';

const uploadDocumentsViewPath = 'features/caseProgression/documents-uploaded';
const documentsUploadedController = Router();

documentsUploadedController.get(CP_EVIDENCE_UPLOAD_SUBMISSION_URL, (async (req:Request, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const uploadYourDocumentsUrl = UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId);
    const documentsPageUrl = EVIDENCE_UPLOAD_DOCUMENTS_URL.replace(':id', claimId);
    const caseNumber = caseNumberPrettify(claimId);
    res.render(uploadDocumentsViewPath, {caseNumber, uploadYourDocumentsUrl, documentsPageUrl, noCrumbs: true});
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default documentsUploadedController;
