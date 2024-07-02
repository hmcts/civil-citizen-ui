import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  BACK_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL, DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL,
  DQ_MULTITRACK_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_URL,
} from 'routes/urls';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  DisclosureOfElectronicDocumentsIssues,
} from 'models/directionsQuestionnaire/mintiMultitrack/DisclosureOfElectronicDocumentsIssues';
import {TypeOfDisclosureDocument} from 'models/directionsQuestionnaire/hearing/disclosureOfDocuments';

const disclosureOfElectronicDocumentsIssues = Router();
const disclosureOfElectronicDocumentsIssuesViewPath = 'features/directionsQuestionnaire/mintiMultiTrack/disclosure-of-electronic-documents-issues';
const DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_PAGE = 'PAGES.DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES.';

function renderView(form: GenericForm<DisclosureOfElectronicDocumentsIssues>, res: Response): void {
  res.render(disclosureOfElectronicDocumentsIssuesViewPath, {
    form,
    pageTitle: `${DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_PAGE}PAGE_TITLE`,
    title: `${DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_PAGE}TITLE`,
    backLinkUrl: BACK_URL,
  });
}

disclosureOfElectronicDocumentsIssues.get(DQ_MULTITRACK_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_URL, (async (req, res, next: NextFunction) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const issues = directionQuestionnaire.hearing?.disclosureOfElectronicDocumentsIssues ?
      new DisclosureOfElectronicDocumentsIssues(directionQuestionnaire.hearing.disclosureOfElectronicDocumentsIssues) : new DisclosureOfElectronicDocumentsIssues();
    renderView(new GenericForm(issues), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

disclosureOfElectronicDocumentsIssues.post(DQ_MULTITRACK_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const disclosureOfElectronicDocumentsIssuesForm = new GenericForm(new DisclosureOfElectronicDocumentsIssues(req.body.disclosureOfElectronicDocumentsIssues));
    disclosureOfElectronicDocumentsIssuesForm.validateSync();
    if (disclosureOfElectronicDocumentsIssuesForm.hasErrors()) {
      renderView(disclosureOfElectronicDocumentsIssuesForm, res);
    } else {
      await saveDirectionQuestionnaire(
        generateRedisKey(<AppRequest>req),
        disclosureOfElectronicDocumentsIssuesForm.model.disclosureOfElectronicDocumentsIssues,
        'disclosureOfElectronicDocumentsIssues',
        'hearing');
      if (directionQuestionnaire.hearing?.disclosureOfDocuments?.documentsTypeChosen?.includes(TypeOfDisclosureDocument.NON_ELECTRONIC)) {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL));
      }
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default disclosureOfElectronicDocumentsIssues;
