import {NextFunction, Request, Response,RequestHandler, Router} from 'express';
import {CP_UPLOAD_DOCUMENTS_URL} from '../../urls';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getWitnessContent} from 'services/features/caseProgression/witnessService';
import {UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';

const uploadDocumentsViewPath = 'features/caseProgression/upload-documents';
const uploadDocumentsController = Router();
uploadDocumentsController.get(CP_UPLOAD_DOCUMENTS_URL, (async (req:Request, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim: Claim = await getCaseDataFromStore(claimId);

    if (claim && !claim.isEmpty()) {
      const uploadDocuments = claim.caseProgression.defendantUploadDocuments;
      const disclosureContent: any = undefined; //TODO getDisclosureContent(claim, claimId, getDocumentTypes(uploadDocuments.disclosure));
      const witnessContent = getWitnessContent(claimId, claim, getDocumentTypes(uploadDocuments.witness));
      const expertContent: any = undefined; //TODO = getExpertContent(claim, claimId, getDocumentTypes(uploadDocuments.expert)));
      const trialContent: any = undefined; //TODO = getTrialContent(claim, claimId, getDocumentTypes(uploadDocuments.trial)));
      res.render(uploadDocumentsViewPath, {claim, claimId, disclosureContent, witnessContent,expertContent,trialContent});
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

function getDocumentTypes(sectionToCheck: UploadDocumentTypes[]) {
  return sectionToCheck.filter(document => document.selected === true)
    .flatMap(document => document.documentType);
}

export default uploadDocumentsController;
