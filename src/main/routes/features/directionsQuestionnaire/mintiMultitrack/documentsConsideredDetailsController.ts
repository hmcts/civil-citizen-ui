import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  BACK_URL, DQ_DEFENDANT_EXPERT_EVIDENCE_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL,
} from 'routes/urls';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  ClaimantDocumentsConsideredDetails,
} from 'models/directionsQuestionnaire/mintiMultitrack/claimantDocumentsConsideredDetails';

const documentsConsideredDetailsController = Router();
const claimantDocumentsConsideredDetailsViewPath = 'features/directionsQuestionnaire/mintiMultiTrack/claimant-documents-considered-details';
const DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE = 'PAGES.DOCUMENTS_CONSIDERED_DETAILS.';

function renderView(details: GenericForm<ClaimantDocumentsConsideredDetails>, isClaimant: boolean, res: Response): void {
  const userRoleKey = isClaimant ? 'WITH_DEFENDANT': 'WITH_CLAIMANT';

  res.render(claimantDocumentsConsideredDetailsViewPath, {
    form : details,
    pageTitle: `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}PAGE_TITLE_${userRoleKey}`,
    title: `DOCUMENTS_TO_BE_CONSIDERED.TITLE_${userRoleKey}`,
    backLinkUrl: BACK_URL,
  });
}

documentsConsideredDetailsController.get(DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL, (async (req, res, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const isClaimant = claim.isClaimant();
    const directionQuestionnaire = await getDirectionQuestionnaire(redisKey);
    const details = directionQuestionnaire.hearing?.documentsConsideredDetails ?
      new ClaimantDocumentsConsideredDetails(directionQuestionnaire.hearing.documentsConsideredDetails, isClaimant) : new ClaimantDocumentsConsideredDetails('', isClaimant);

    renderView(new GenericForm(details) , isClaimant, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

documentsConsideredDetailsController.post(DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const isClaimant = claim.isClaimant();
    const form = new GenericForm(new ClaimantDocumentsConsideredDetails(
      req.body.claimantDocumentsConsideredDetails,
      isClaimant, isClaimant? 'ERRORS.DEFENDANT_DOCUMENTS_CONSIDERED' : 'ERRORS.CLAIMANT_DOCUMENTS_CONSIDERED'),
    );
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, isClaimant, res);
    } else {
      await saveDirectionQuestionnaire(
        generateRedisKey(<AppRequest>req),
        form.model.claimantDocumentsConsideredDetails,
        'documentsConsideredDetails',
        'hearing');

      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_EXPERT_EVIDENCE_URL));
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default documentsConsideredDetailsController;
