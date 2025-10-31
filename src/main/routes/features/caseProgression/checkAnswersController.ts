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
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'common/models/AppRequest';
import {GenericForm} from 'common/form/models/genericForm';
import {DocumentUploadSubmissionForm} from 'form/models/caseProgression/documentUploadSubmission';
import {DocumentUploadSections} from 'models/caseProgression/documentUploadSections';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {getClaimById} from 'modules/utilityService';

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
  const cancelUrl = constructResponseUrlWithIdParams(claimId, CP_EVIDENCE_UPLOAD_CANCEL);

  res.render(checkAnswersViewPath, {
    form, topPageContents, summarySections, bottomPageContents, isSmallClaims, cancelUrl, backLinkUrl,
  });
}

documentUploadCheckAnswerController.get(CP_CHECK_ANSWERS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.id;
  const lang = (req.query.lang as string) || req.cookies.lang;
  try {
    req.session.previousUrl = req.originalUrl;
    const claim = await getClaimById(claimId, req,true);
    const form = new GenericForm(new DocumentUploadSubmissionForm());
    renderView(res, form, claim, claimId, claim.isClaimant(), lang);
  } catch (error) {
    next(error);
  }
})as RequestHandler);

documentUploadCheckAnswerController.post(CP_CHECK_ANSWERS_URL, (async (req: Request | AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.id;
  const appReq = req as AppRequest;
  const lang = (req.query.lang as string) || req.cookies.lang;

  try {
    const form = new GenericForm<DocumentUploadSubmissionForm>(new DocumentUploadSubmissionForm(req.body.signed));
    const claim = await getClaimById(claimId, req, true);
    await form.validate();

    if (form.hasErrors()) {
      const isClaimant = claim.isClaimant();
      renderView(res, form, claim, claimId, isClaimant, lang);
      return;
    } else {
      await saveUploadedDocuments(claim, appReq);
      const taskId = appReq.session?.dashboard?.taskIdHearingUploadDocuments;
      if(taskId){
        await civilServiceClient.updateTaskStatus(taskId, appReq);
      }
      const redisKey= generateRedisKey(appReq);
      await deleteDraftClaimFromStore(redisKey);
      res.redirect(constructResponseUrlWithIdParams(claimId, CP_EVIDENCE_UPLOAD_SUBMISSION_URL));
      return;
    }
  } catch (error) {
    next(error);
    return;
  }
})as RequestHandler);

export default documentUploadCheckAnswerController;
