import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  DQ_DEFENDANT_WITNESSES_URL,
  DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL, START_MEDIATION_UPLOAD_FILES,
} from 'routes/urls';
import {
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DisclosureNonElectronicDocument,
} from 'models/directionsQuestionnaire/mintiMultitrack/disclosureNonElectronicDocument';
import {getWaitIsDisclosureTextAreaInformation} from 'services/commons/textAreaInformations';

const multiTrackDisclosureNonElectronicDocuments = Router();
const disclosureNonElectronicDocumentsViewPath = 'features/directionsQuestionnaire/mintiMultiTrack/disclosure-non-electronic-documents';
const DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE = 'PAGES.DISCLOSURE_NON_ELECTRONIC_DOCUMENTS.';

function renderView(disclosureNonElectronicDocument: GenericForm<DisclosureNonElectronicDocument>, res: Response): void {
  const form = disclosureNonElectronicDocument;
  const whatIsDisclosureSummarySection = getWaitIsDisclosureTextAreaInformation();

  res.render(disclosureNonElectronicDocumentsViewPath, {
    form,
    whatIsDisclosureSummarySection,
    pageTitle: `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}PAGE_TITLE`,
    backLinkUrl: constructResponseUrlWithIdParams('claimId', START_MEDIATION_UPLOAD_FILES),
  });
}

multiTrackDisclosureNonElectronicDocuments.get(DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL, (async (req, res, next: NextFunction) => {
  try {
    //const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    //const disclosureNonElectronicDocument = directionQuestionnaire.vulnerabilityQuestions?.vulnerability ?
    //  directionQuestionnaire.vulnerabilityQuestions.vulnerability : new DisclosureNonElectronicDocument();

    renderView(new GenericForm(new DisclosureNonElectronicDocument()) , res);
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
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), disclosureNonElectronicDocumentForm.model.disclosureNonElectronicDocuments, 'dqPropertyName');
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_WITNESSES_URL));
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default multiTrackDisclosureNonElectronicDocuments;
