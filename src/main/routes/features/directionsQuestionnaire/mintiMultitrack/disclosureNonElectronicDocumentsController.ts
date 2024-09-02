import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  BACK_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL,
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
  DisclosureNonElectronicDocument,
} from 'models/directionsQuestionnaire/mintiMultitrack/disclosureNonElectronicDocument';
import {getWhatIsDisclosureDetailContent} from 'services/commons/detailContents';

const multiTrackDisclosureNonElectronicDocuments = Router();
const disclosureNonElectronicDocumentsViewPath = 'features/directionsQuestionnaire/mintiMultiTrack/disclosure-non-electronic-documents';
const DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE = 'PAGES.DISCLOSURE_NON_ELECTRONIC_DOCUMENTS.';

function renderView(disclosureNonElectronicDocument: GenericForm<DisclosureNonElectronicDocument>, res: Response): void {
  const form = disclosureNonElectronicDocument;
  const whatIsDisclosureDetailsContent = getWhatIsDisclosureDetailContent();

  res.render(disclosureNonElectronicDocumentsViewPath, {
    form,
    whatIsDisclosureDetailsContent,
    pageTitle: `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}TEXT_AREA.LABEL`,
    title: `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}PAGE_TITLE`,
    backLinkUrl: BACK_URL,
  });
}

multiTrackDisclosureNonElectronicDocuments.get(DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL, (async (req, res, next: NextFunction) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const disclosureNonElectronicDocument = directionQuestionnaire.hearing?.disclosureNonElectronicDocument ?
      new DisclosureNonElectronicDocument(directionQuestionnaire.hearing.disclosureNonElectronicDocument) : new DisclosureNonElectronicDocument();
    renderView(new GenericForm(disclosureNonElectronicDocument) , res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

multiTrackDisclosureNonElectronicDocuments.post(DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL, (async (req: Request, res: Response, next: NextFunction) => {
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

export default multiTrackDisclosureNonElectronicDocuments;
