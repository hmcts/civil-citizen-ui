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
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {t} from 'i18next';

const claimantDocumentsTobeConsideredController = Router();
const hasClaimantDocumentsToBeConsideredViewPath = 'features/directionsQuestionnaire/mintiMultiTrack/claimant-documents-to-be-considered';
const CLAIMANT_DOCS_FOR_DISCLOSURE_PAGE = 'PAGES.CLAIMANT_DOCS_FOR_DISCLOSURE.';

function renderView(hasClaimantDocumentsToBeConsidered: GenericForm<GenericYesNo>, claimId: string, isClaimant: boolean, lng: string, res: Response): void {
  const form = hasClaimantDocumentsToBeConsidered;
  const userRoleKey = isClaimant ? 'DEFENDANT': 'CLAIMANT';
  const userRole = t(`COMMON.${userRoleKey}`, {lng});
  res.render(hasClaimantDocumentsToBeConsideredViewPath, {
    form,
    pageTitle: t(`${CLAIMANT_DOCS_FOR_DISCLOSURE_PAGE}PAGE_TITLE`, {lng, userRole}),
    title: t(`${CLAIMANT_DOCS_FOR_DISCLOSURE_PAGE}TITLE`, {lng, userRole}),
    componentText: t(`${CLAIMANT_DOCS_FOR_DISCLOSURE_PAGE}PAGE_TITLE`, {lng, userRole}),
    backLinkUrl: BACK_URL,
  });
}

claimantDocumentsTobeConsideredController.get(DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const hasClaimantDocumentsToBeConsidered = directionQuestionnaire.hearing?.hasClaimantDocumentsToBeConsidered ?
      new GenericYesNo(directionQuestionnaire.hearing?.hasClaimantDocumentsToBeConsidered?.option) : new GenericYesNo();
    renderView(new GenericForm(hasClaimantDocumentsToBeConsidered), claimId, false, lang, res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

claimantDocumentsTobeConsideredController.post(DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;

    const hasClaimantDocumentsToBeConsideredForm = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.CLAIMANT_DOCS_FOR_DISCLOSURE'));
    hasClaimantDocumentsToBeConsideredForm.validateSync();
    if (hasClaimantDocumentsToBeConsideredForm.hasErrors()) {
      renderView(hasClaimantDocumentsToBeConsideredForm, claimId,true, lang, res);
    } else {
      await saveDirectionQuestionnaire(
        generateRedisKey(<AppRequest>req),
        hasClaimantDocumentsToBeConsideredForm.model,
        'hasClaimantDocumentsToBeConsidered',
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

export default claimantDocumentsTobeConsideredController;
