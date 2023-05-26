import {NextFunction, Request, Response,RequestHandler, Router} from 'express';
import {CP_UPLOAD_DOCUMENTS_URL} from '../../urls';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getWitnessContent} from 'services/features/caseProgression/witnessService';
import {getTrialContent} from "services/features/caseProgression/trialService";

const uploadDocumentsViewPath = 'features/caseProgression/upload-documents';
const uploadDocumentsController = Router();
uploadDocumentsController.get(CP_UPLOAD_DOCUMENTS_URL, (async (req:Request, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim: Claim = await getCaseDataFromStore(claimId);

    if (claim && !claim.isEmpty()) {
      const disclosureContent:string = undefined ; //TODO getDisclosureContent(claim, claimId);
      const witnessContent = getWitnessContent(claimId, claim);
      const expertContent:string = undefined ; //TODO = getExpertContent(claim, claimId);
      const trialContent:string = undefined ; getTrialContent(claimId, claim);
      res.render(uploadDocumentsViewPath, {claim, claimId, disclosureContent, witnessContent,expertContent,trialContent});
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default uploadDocumentsController;
