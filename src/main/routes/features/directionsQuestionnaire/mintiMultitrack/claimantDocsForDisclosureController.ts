import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL, DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL,
} from 'routes/urls';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';

const claimantDocsForDisclosureController = Router();
const hasClaimantDocumentsToBeConsideredViewPath = 'features/common/yes-no-common-page';
const DISCLOSURCLAIMANT_DOCS_FOR_DISCLOSURE_PAGE = 'PAGES.CLAIMANT_DOCS_FOR_DISCLOSURE.';

function renderView(hasClaimantDocumentsToBeConsidered: GenericForm<GenericYesNo>, claimId: string, res: Response): void {
  const form = hasClaimantDocumentsToBeConsidered;
  res.render(hasClaimantDocumentsToBeConsideredViewPath, {
    form,
    pageTitle: `${DISCLOSURCLAIMANT_DOCS_FOR_DISCLOSURE_PAGE}PAGE_TITLE`,
    title: `${DISCLOSURCLAIMANT_DOCS_FOR_DISCLOSURE_PAGE}TITLE`,
    componentText: `${DISCLOSURCLAIMANT_DOCS_FOR_DISCLOSURE_PAGE}PAGE_TITLE`,
    backLinkUrl: constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL),
    saveContinueButtonLabel: 'SAVE_AND_CONTINUE_CARM',
  });
}

claimantDocsForDisclosureController.get(DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const hasClaimantDocumentsToBeConsidered = directionQuestionnaire.hearing?.hasClaimantDocumentsToBeConsidered ?
      new GenericYesNo(directionQuestionnaire.hearing?.hasClaimantDocumentsToBeConsidered?.option) : new GenericYesNo();
    renderView(new GenericForm(hasClaimantDocumentsToBeConsidered), claimId , res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

claimantDocsForDisclosureController.post(DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const hasClaimantDocumentsToBeConsideredForm = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.CLAIMANT_DOCS_FOR_DISCLOSURE'));
    hasClaimantDocumentsToBeConsideredForm.validateSync();
    if (hasClaimantDocumentsToBeConsideredForm.hasErrors()) {
      renderView(hasClaimantDocumentsToBeConsideredForm, claimId, res);
    } else {
      await saveDirectionQuestionnaire(
        generateRedisKey(<AppRequest>req),
        hasClaimantDocumentsToBeConsideredForm.model,
        'hasClaimantDocumentsToBeConsidered',
        'hearing');
      //TODO add the url.
      res.redirect(constructResponseUrlWithIdParams(claimId, 'todo'));
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantDocsForDisclosureController;
