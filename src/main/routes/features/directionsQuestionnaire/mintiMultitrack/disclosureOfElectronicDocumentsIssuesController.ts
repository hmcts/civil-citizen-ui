import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  DQ_DEFENDANT_EXPERT_EVIDENCE_URL,
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

const disclosureOfElectronicDocumentsIssues = Router();
const disclosureOfElectronicDocumentsIssuesViewPath = 'features/directionsQuestionnaire/mintiMultiTrack/disclosure-of-electronic-documents-issues';

function renderView(form: GenericForm<DisclosureOfElectronicDocumentsIssues>, res: Response): void {
  res.render(disclosureOfElectronicDocumentsIssuesViewPath, {
    form,
    //TODO ADD THE BACK URL
    backLinkUrl: constructResponseUrlWithIdParams('claimId', 'todo'),
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
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DEFENDANT_EXPERT_EVIDENCE_URL)); //TODO update back link
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default disclosureOfElectronicDocumentsIssues;
