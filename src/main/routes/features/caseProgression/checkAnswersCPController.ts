import {NextFunction, Request, Response, RequestHandler, Router} from 'express';
import {CP_CHECK_ANSWERS_URL} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {getDocuments} from 'services/features/caseProgression/caseProgressionService';
import {ClaimantOrDefendant} from 'models/partyType';
import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';

const checkAnswersCPViewPath = 'features/caseProgression/check-answers';
const checkAnswersCPController = Router();

async function renderView(res: Response, claimId: string, form: GenericForm<UploadDocuments> = null) {
  const claim: Claim = await getCaseDataFromStore(claimId);
  const claimantFullName = claim.getClaimantFullName();
  const defendantFullName = claim.getDefendantFullName();
  const documents = claim.caseProgression.defendantDocuments;
  if (claim && !claim.isEmpty()) {

    res.render(checkAnswersCPViewPath, {
      form,
      claim,
      claimId,
      claimantFullName,
      defendantFullName,
      documents,
    });
  }
}

checkAnswersCPController.get(CP_CHECK_ANSWERS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const documentsList = await getDocuments(claimId,ClaimantOrDefendant.DEFENDANT);
    const form = new GenericForm(documentsList);
    await renderView(res, claimId, form);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default checkAnswersCPController;
