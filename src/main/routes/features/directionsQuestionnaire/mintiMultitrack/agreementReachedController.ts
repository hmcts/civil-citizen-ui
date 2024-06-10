import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  DQ_MULTITRACK_AGREEMENT_REACHED_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL,
} from 'routes/urls';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DisclosureNonElectronicDocument,
} from 'models/directionsQuestionnaire/mintiMultitrack/disclosureNonElectronicDocument';
import {
  getHowtoAgreeDisclosureOfElectronicDocumentsContent,
} from 'services/commons/detailContents';

const agreementReachedController = Router();
const disclosureNonElectronicDocumentsViewPath = 'features/directionsQuestionnaire/mintiMultiTrack/agreement-reached';
const DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE = 'PAGES.DISCLOSURE_NON_ELECTRONIC_DOCUMENTS.';

function renderView(disclosureNonElectronicDocument: GenericForm<DisclosureNonElectronicDocument>, res: Response): void {
  const form = disclosureNonElectronicDocument;
  const howtoAgreeDisclosureOfElectronicDocumentsContent = getHowtoAgreeDisclosureOfElectronicDocumentsContent();


  res.render(disclosureNonElectronicDocumentsViewPath, {
    form,
    howtoAgreeDisclosureOfElectronicDocumentsContent,
    pageTitle: `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}TEXT_AREA.LABEL`,
    title: `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}PAGE_TITLE`,
    //TODO ADD THE BACK URL
    backLinkUrl: constructResponseUrlWithIdParams('claimId', 'todo'),
  });
}

agreementReachedController.get(DQ_MULTITRACK_AGREEMENT_REACHED_URL, (async (req, res, next: NextFunction) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const disclosureNonElectronicDocument = directionQuestionnaire.hearing?.disclosureNonElectronicDocument ?
      new DisclosureNonElectronicDocument(directionQuestionnaire.hearing.disclosureNonElectronicDocument) : new DisclosureNonElectronicDocument();
    renderView(new GenericForm(disclosureNonElectronicDocument) , res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

agreementReachedController.post(DQ_MULTITRACK_AGREEMENT_REACHED_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const disclosureNonElectronicDocumentForm = new GenericForm(new DisclosureNonElectronicDocument(req.body.disclosureNonElectronicDocuments));
    disclosureNonElectronicDocumentForm.validateSync();
    if (disclosureNonElectronicDocumentForm.hasErrors()) {
      renderView(disclosureNonElectronicDocumentForm, res);
    } else {
      await saveDirectionQuestionnaire(
        generateRedisKey(<AppRequest>req),
        disclosureNonElectronicDocumentForm.model.disclosureNonElectronicDocuments,
        'disclosureNonElectronicDocument',
        'hearing');
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL));
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default agreementReachedController;
