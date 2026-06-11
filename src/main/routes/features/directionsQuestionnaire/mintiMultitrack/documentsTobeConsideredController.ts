import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  BACK_URL, DQ_DEFENDANT_EXPERT_EVIDENCE_URL, DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL,
} from 'routes/urls';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';

const documentsTobeConsideredController = Router();
const hasClaimantDocumentsToBeConsideredViewPath = 'features/directionsQuestionnaire/mintiMultiTrack/claimant-documents-to-be-considered';
const CLAIMANT_DOCS_FOR_DISCLOSURE_PAGE = 'PAGES.DOCS_FOR_DISCLOSURE.';

function renderView(hasClaimantDocumentsToBeConsidered: GenericForm<GenericYesNo>, isClaimant: boolean, res: Response): void {
  const form = hasClaimantDocumentsToBeConsidered;
  const userRoleKey = isClaimant ? 'WITH_DEFENDANT': 'WITH_CLAIMANT';
  res.render(hasClaimantDocumentsToBeConsideredViewPath, {
    form,
    pageTitle: `${CLAIMANT_DOCS_FOR_DISCLOSURE_PAGE}PAGE_TITLE_${userRoleKey}`,
    title: `DOCUMENTS_TO_BE_CONSIDERED.TITLE_${userRoleKey}`,
    componentText: `${CLAIMANT_DOCS_FOR_DISCLOSURE_PAGE}COMPONENT_TEXT_${userRoleKey}`,
    backLinkUrl: BACK_URL,
  });
}

documentsTobeConsideredController.get(DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const directionQuestionnaire = await getDirectionQuestionnaire(redisKey);
    const hasClaimantDocumentsToBeConsidered = directionQuestionnaire.hearing?.hasDocumentsToBeConsidered ?
      new GenericYesNo(directionQuestionnaire.hearing?.hasDocumentsToBeConsidered?.option) : new GenericYesNo();
    renderView(new GenericForm(hasClaimantDocumentsToBeConsidered), claim.isClaimant(), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

documentsTobeConsideredController.post(DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const hasClaimantDocumentsToBeConsideredForm = new GenericForm(new GenericYesNo(req.body.option, claim.isClaimant()? 'ERRORS.DEFENDANT_DOCS_FOR_DISCLOSURE' : 'ERRORS.CLAIMANT_DOCS_FOR_DISCLOSURE'));
    hasClaimantDocumentsToBeConsideredForm.validateSync();
    if (hasClaimantDocumentsToBeConsideredForm.hasErrors()) {

      renderView(hasClaimantDocumentsToBeConsideredForm, claim.isClaimant(), res);
    } else {
      await saveDirectionQuestionnaire(
        redisKey,
        hasClaimantDocumentsToBeConsideredForm.model,
        'hasDocumentsToBeConsidered',
        'hearing');
      if (hasClaimantDocumentsToBeConsideredForm.model.option === YesNo.YES){
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_EXPERT_EVIDENCE_URL));
      }

    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default documentsTobeConsideredController;
