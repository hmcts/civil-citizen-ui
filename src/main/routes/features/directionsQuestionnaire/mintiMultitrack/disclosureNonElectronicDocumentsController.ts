import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  DQ_DEFENDANT_WITNESSES_URL,
  DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL, START_MEDIATION_UPLOAD_FILES,
} from 'routes/urls';
import {
  getConfirmYourDetailsEvidenceForm, saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {SummaryText, SummaryTextContentBuilder} from 'models/summaryText/summaryText';
import {disclosureOfDocumentsUrl} from 'common/utils/externalURLs';

const multiTrackDisclosureNonElectronicDocuments = Router();
const disclosureNonElectronicDocumentsViewPath = 'features/directionsQuestionnaire/mintiMultiTrack/disclosure-non-electronic-documents';
const DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE = 'PAGES.DISCLOSURE_NON_ELECTRONIC_DOCUMENTS.';

function renderView(res: Response): void {
  const whatIsDisclosureSummarySection = new SummaryText(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}SUMMARY_TEXT.TITLE`, new SummaryTextContentBuilder()
    .addParagraph(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}SUMMARY_TEXT.PARAGRAPH1`)
    .addParagraph(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}SUMMARY_TEXT.PARAGRAPH2`)
    .addParagraph(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}SUMMARY_TEXT.PARAGRAPH3`)
    .addParagraph(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}SUMMARY_TEXT.PARAGRAPH4`)
    .addLink(`${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}SUMMARY_TEXT.URL.TEXT`, disclosureOfDocumentsUrl, `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}SUMMARY_TEXT.URL.BEFORE`, `${DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_PAGE}SUMMARY_TEXT.URL.AFTER`, null, true)
    .build());
  res.render(disclosureNonElectronicDocumentsViewPath, {
    whatIsDisclosureSummarySection,
    pageTitle: 'PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE',
    backLinkUrl: constructResponseUrlWithIdParams('claimId', START_MEDIATION_UPLOAD_FILES),
  });
}

multiTrackDisclosureNonElectronicDocuments.get(DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL, (async (req, res, next: NextFunction) => {
  try {
    //const confirmYourDetailsEvidence = await getConfirmYourDetailsEvidence(generateRedisKey(<AppRequest>req), dqPropertyName);
    renderView(res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

multiTrackDisclosureNonElectronicDocuments.post(DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const confirmYourDetailsEvidence = new GenericForm(getConfirmYourDetailsEvidenceForm(req.body));
    confirmYourDetailsEvidence.validateSync();

    if (confirmYourDetailsEvidence.hasErrors()) {
      renderView(res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), confirmYourDetailsEvidence.model, 'dqPropertyName');
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_WITNESSES_URL));
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default multiTrackDisclosureNonElectronicDocuments;
