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
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {getClaimById} from 'modules/utilityService';
import {getRouteParam} from 'common/utils/routeParamUtils';

const checkAnswersViewPath = 'features/caseProgression/check-answers';
const documentUploadCheckAnswerController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const getUploadedDocuments = (claim: Claim): UploadDocumentsUserForm =>
  claim.isClaimant() ? claim.caseProgression?.claimantDocuments : claim.caseProgression?.defendantDocuments;

function renderView(res: Response, form: GenericForm<DocumentUploadSubmissionForm>, claim: Claim, claimId: string, summarySections: DocumentUploadSections) {
  const topPageContents = getTopElements(claim);
  const isSmallClaims = claim.isSmallClaimsTrackDQ;
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL);
  const bottomPageContents = getBottomElements();
  const cancelUrl = constructResponseUrlWithIdParams(claimId, CP_EVIDENCE_UPLOAD_CANCEL);

  res.render(checkAnswersViewPath, {
    form, topPageContents, summarySections, bottomPageContents, isSmallClaims, cancelUrl, backLinkUrl,
  });
}

documentUploadCheckAnswerController.get(CP_CHECK_ANSWERS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = getRouteParam(req, 'id');
  const lang = (req.query.lang as string) || req.cookies.lang;
  try {
    req.session.previousUrl = req.originalUrl;
    const claim = await getClaimById(claimId, req,true);
    const summarySections = getSummarySections(getUploadedDocuments(claim), claimId, claim.isSmallClaimsTrackDQ, lang);
    if (summarySections === null) {
      return res.redirect(constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL));
    }
    const form = new GenericForm(new DocumentUploadSubmissionForm());
    renderView(res, form, claim, claimId, summarySections);
  } catch (error) {
    next(error);
  }
})as RequestHandler);

documentUploadCheckAnswerController.post(CP_CHECK_ANSWERS_URL, (async (req: Request | AppRequest, res: Response, next: NextFunction) => {
  const claimId = getRouteParam(req, 'id');
  const appReq = req as AppRequest;
  const lang = (req.query.lang as string) || req.cookies.lang;

  try {
    const form = new GenericForm<DocumentUploadSubmissionForm>(new DocumentUploadSubmissionForm(req.body.signed));
    const claim = await getClaimById(claimId, req, true);
    const uploadedDocuments = getUploadedDocuments(claim);
    if (!uploadedDocuments) {
      return res.redirect(constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL));
    }
    await form.validate();

    if (form.hasErrors()) {
      renderView(res, form, claim, claimId, getSummarySections(uploadedDocuments, claimId, claim.isSmallClaimsTrackDQ, lang));
      return;
    }
    await saveUploadedDocuments(claim, appReq);
    const taskId = appReq.session?.dashboard?.taskIdHearingUploadDocuments;
    if(taskId){
      await civilServiceClient.updateTaskStatus(taskId, appReq);
    }
    const redisKey= generateRedisKey(appReq);
    await deleteDraftClaimFromStore(redisKey);
    res.redirect(constructResponseUrlWithIdParams(claimId, CP_EVIDENCE_UPLOAD_SUBMISSION_URL));
  } catch (error) {
    next(error);
    return;
  }
})as RequestHandler);

export default documentUploadCheckAnswerController;
