import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {ConfirmYourDetailsEvidence} from 'form/models/confirmYourDetailsEvidence';
import {
  DQ_DEFENDANT_WITNESSES_URL,
  DQ_MULTITRACK_NON_ELETRONIC_DOCUMENTS_URL, START_MEDIATION_UPLOAD_FILES,
} from 'routes/urls';
import {
  getConfirmYourDetailsEvidence,
  getConfirmYourDetailsEvidenceForm, saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {SummaryText} from 'models/summaryText/summaryText';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

const multiTrackDisclosureNonElectronicDocuments = Router();
const disclosureNonElectronicDocumentsViewPath = 'features/directionsQuestionnaire/mintiMultiTrack/disclosure-non-electronic-documents';
const dqPropertyName = 'confirmYourDetailsEvidence';

function renderView(form: GenericForm<ConfirmYourDetailsEvidence>, res: Response): void {
  const whatIsDisclosure = new SummaryText('test', new PageSectionBuilder()
    .addTitle('test')
    .build());
  res.render(disclosureNonElectronicDocumentsViewPath, {
    form,
    whatIsDisclosure,
    pageTitle: 'PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE',
    backLinkUrl : constructResponseUrlWithIdParams('claimId', START_MEDIATION_UPLOAD_FILES),

  });
}

multiTrackDisclosureNonElectronicDocuments.get(DQ_MULTITRACK_NON_ELETRONIC_DOCUMENTS_URL, (async (req, res, next: NextFunction) => {
  try {
    const confirmYourDetailsEvidence = await getConfirmYourDetailsEvidence(generateRedisKey(<AppRequest>req), dqPropertyName);
    renderView(new GenericForm<ConfirmYourDetailsEvidence>(confirmYourDetailsEvidence), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

multiTrackDisclosureNonElectronicDocuments.post(DQ_MULTITRACK_NON_ELETRONIC_DOCUMENTS_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const confirmYourDetailsEvidence = new GenericForm(getConfirmYourDetailsEvidenceForm(req.body));
    confirmYourDetailsEvidence.validateSync();

    if (confirmYourDetailsEvidence.hasErrors()) {
      renderView(confirmYourDetailsEvidence, res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), confirmYourDetailsEvidence.model, dqPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_WITNESSES_URL));
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default multiTrackDisclosureNonElectronicDocuments;
