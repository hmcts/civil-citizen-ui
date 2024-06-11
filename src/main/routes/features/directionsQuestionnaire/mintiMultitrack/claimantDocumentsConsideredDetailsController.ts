import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL, DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL,
  DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL,
} from 'routes/urls';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  ClaimantDocumentsConsideredDetails,
} from 'models/directionsQuestionnaire/mintiMultitrack/claimantDocumentsConsideredDetails';

const claimantDocumentsConsideredDetailsController = Router();
const claimantDocumentsConsideredDetailsViewPath = 'features/directionsQuestionnaire/mintiMultiTrack/claimant-documents-considered-details';
const DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE = 'PAGES.CLAIMANT_DOCUMENTS_CONSIDERED_DETAILS.';

function renderView(details: GenericForm<ClaimantDocumentsConsideredDetails>, res: Response): void {
  const form = details;

  res.render(claimantDocumentsConsideredDetailsViewPath, {
    form,
    pageTitle: `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}PAGE_TITLE`,
    title: `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}TITLE`,
    //TODO ADD THE BACK URL
    backLinkUrl: constructResponseUrlWithIdParams('claimId', DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL),
  });
}

claimantDocumentsConsideredDetailsController.get(DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL, (async (req, res, next: NextFunction) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const details = directionQuestionnaire.hearing?.claimantDocumentsConsideredDetails ?
      new ClaimantDocumentsConsideredDetails(directionQuestionnaire.hearing.claimantDocumentsConsideredDetails) : new ClaimantDocumentsConsideredDetails();
    renderView(new GenericForm(details) , res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

claimantDocumentsConsideredDetailsController.post(DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(new ClaimantDocumentsConsideredDetails(req.body.claimantDocumentsConsideredDetails));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDirectionQuestionnaire(
        generateRedisKey(<AppRequest>req),
        form.model.claimantDocumentsConsideredDetails,
        'claimantDocumentsConsideredDetails',
        'hearing');
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL)); //todo change redirect url
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantDocumentsConsideredDetailsController;
