import {NextFunction, Request, Response,RequestHandler, Router} from 'express';
import {CP_UPLOAD_DOCUMENTS_URL} from '../../urls';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getWitnessContent} from 'services/features/caseProgression/witnessService';

const uploadDocumentsViewPath = 'features/caseProgression/upload-documents';
const uploadDocumentsController = Router();
uploadDocumentsController.get(CP_UPLOAD_DOCUMENTS_URL, (async (req:Request, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim: Claim = await getCaseDataFromStore(claimId);

    if (claim && !claim.isEmpty()) {
      const documentTypes = claim.caseProgression.defendantUploadDocuments;
      let witnessContent, disclosureContent, expertContent, trialContent = undefined;
      if (documentTypes.disclosure.filter(index => index.selected === true).length > 0) {
        disclosureContent = undefined; //TODO getDisclosureContent(claim, claimId);
      }
      if (documentTypes.witness.filter(index => index.selected === true).length > 0) {
        witnessContent = getWitnessContent(claimId, claim);
      }
      if (documentTypes.expert.filter(index => index.selected === true).length > 0) {
        expertContent = undefined; //TODO = getExpertContent(claim, claimId);
      }
      if (documentTypes.trial.filter(index => index.selected === true).length > 0) {
        trialContent = undefined; //TODO = getTrialContent(claim, claimId);
      }
      res.render(uploadDocumentsViewPath, {claim, claimId, disclosureContent, witnessContent,expertContent,trialContent});
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default uploadDocumentsController;
