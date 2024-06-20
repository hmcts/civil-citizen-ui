import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  CP_CHECK_ANSWERS_URL,
  CP_EVIDENCE_UPLOAD_CANCEL,
  CP_EVIDENCE_UPLOAD_SUBMISSION_URL, CP_UPLOAD_DOCUMENTS_URL,
} from '../../urls';
import {
  getBottomElements,
  getSummarySections,
  getTopElements, saveUploadedDocuments,
} from 'services/features/caseProgression/checkYourAnswers/checkAnswersService';
import {deleteDraftClaimFromStore, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'common/models/AppRequest';
import {GenericForm} from 'common/form/models/genericForm';
import {DocumentUploadSubmissionForm} from 'form/models/caseProgression/documentUploadSubmission';
import {DocumentUploadSections} from 'models/caseProgression/documentUploadSections';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';

const checkAnswersViewPath = 'features/caseProgression/check-answers';
const documentUploadCheckAnswerController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
function renderView(res: Response, form: GenericForm<DocumentUploadSubmissionForm>, claim: Claim, claimId: string, isClaimant: boolean, lang: string) {
  const topPageContents = getTopElements(claim);
  let summarySections: DocumentUploadSections;
  const isSmallClaims = claim.isSmallClaimsTrackDQ;
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);

  if(isClaimant) {
    summarySections = getSummarySections(claim.caseProgression.claimantDocuments, claimId, isSmallClaims, lang);
  } else {
    summarySections = getSummarySections(claim.caseProgression.defendantDocuments, claimId, isSmallClaims, lang);
  }
  const bottomPageContents = getBottomElements();
  const cancelUrl = constructResponseUrlWithIdParams(claim.id, CP_EVIDENCE_UPLOAD_CANCEL);

  res.render(checkAnswersViewPath, {
    form, topPageContents, summarySections, bottomPageContents, isSmallClaims, cancelUrl, backLinkUrl,
  });
}

documentUploadCheckAnswerController.get(CP_CHECK_ANSWERS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    req.session.previousUrl = req.originalUrl;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getCaseDataFromStore(claimId);
    const form = new GenericForm(new DocumentUploadSubmissionForm());
    renderView(res, form, claim, claimId, claim.isClaimant(), lang);
  } catch (error) {
    next(error);
  }
})as RequestHandler);

documentUploadCheckAnswerController.post(CP_CHECK_ANSWERS_URL, (async (req: Request | AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const form = new GenericForm(new DocumentUploadSubmissionForm(req.body.signed));
    const claim = await getCaseDataFromStore(claimId);
    await form.validate();

    if (form.hasErrors()) {
      const isSmallClaims = claim.isSmallClaimsTrackDQ;
      renderView(res, form, claim, claimId, isSmallClaims, lang);
    } else {
      await saveUploadedDocuments(claim, <AppRequest>req);
      if((<AppRequest>req).session?.dashboard?.taskIdHearingUploadDocuments){
        await civilServiceClient.updateTaskStatus((<AppRequest>req)?.session?.dashboard?.taskIdHearingUploadDocuments, <AppRequest>req);
      }
      await deleteDraftClaimFromStore(claimId);
      res.redirect(constructResponseUrlWithIdParams(claim.id, CP_EVIDENCE_UPLOAD_SUBMISSION_URL));
    }
  } catch (error) {
    next(error);
  }

})as RequestHandler);

export default documentUploadCheckAnswerController;
