import {NextFunction, Response, Router} from 'express';
import {CP_UPLOAD_DOCUMENTS_URL} from '../../urls';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getWitnessContent} from 'services/features/caseProgression/witnessService';
import {Claim} from 'models/claim';
import {ClaimSummaryContent} from 'form/models/claimSummarySection';

const uploadDocumentsViewPath = 'features/caseProgression/upload-documents';
const uploadDocumentsController = Router();

function renderView(claim: Claim, claimId:string, disclosureContent: string, witnessContent: ClaimSummaryContent[],expertContent: string,trialContent: string, res: Response): void {
  res.render(uploadDocumentsViewPath, {claim, claimId, disclosureContent, witnessContent,expertContent,trialContent});
}
uploadDocumentsController.get(CP_UPLOAD_DOCUMENTS_URL, async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(claimId);
    const disclosureContent:string = undefined ; //TODO getDisclosureContent(claim, claimId);
    const witnessContent = getWitnessContent(claimId, claim);
    const expertContent:string = undefined ; //TODO = getExpertContent(claim, claimId);
    const trialContent:string = undefined ; //TODO = getTrialContent(claim, claimId);
    renderView (claim, claimId, disclosureContent, witnessContent,expertContent,trialContent,res);

  } catch (error) {
    next(error);
  }
});

export default uploadDocumentsController;
