import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CP_CHECK_ANSWERS_URL, CP_EVIDENCE_UPLOAD_CANCEL, CP_EVIDENCE_UPLOAD_SUBMISSION_URL} from '../../urls';
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
import {documentUploadSubmissionForm} from 'form/models/caseProgression/documentUploadSubmission';
import {documentUploadSections} from 'models/caseProgression/documentUploadSections';

const checkAnswersViewPath = 'features/caseProgression/check-answers';
const documentUploadCheckAnswerController = Router();

function renderView(res: Response, form: GenericForm<documentUploadSubmissionForm>, claim: Claim, claimId: string, isClaimant: boolean, lang: string) {
  const topPageContents = getTopElements(claim);
  let summarySections: documentUploadSections;
  const isSmallClaims = claim.isSmallClaimsTrackDQ;

  if(isClaimant) {
    summarySections = getSummarySections(claim.caseProgression.claimantDocuments, claimId, isSmallClaims, lang);
  } else {
    summarySections = getSummarySections(claim.caseProgression.defendantDocuments, claimId, isSmallClaims, lang);
  }
  const bottomPageContents = getBottomElements();
  const cancelUrl = constructResponseUrlWithIdParams(claim.id, CP_EVIDENCE_UPLOAD_CANCEL);

  res.render(checkAnswersViewPath, {
    form, topPageContents, summarySections, bottomPageContents, isSmallClaims, cancelUrl,
  });
}

documentUploadCheckAnswerController.get(CP_CHECK_ANSWERS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    req.session.previousUrl = req.originalUrl;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getCaseDataFromStore(claimId);
    const form = new GenericForm(new documentUploadSubmissionForm());
    renderView(res, form, claim, claimId, claim.isClaimant(), lang);
  } catch (error) {
    next(error);
  }
})as RequestHandler);

documentUploadCheckAnswerController.post(CP_CHECK_ANSWERS_URL, (async (req: Request | AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const form = new GenericForm(new documentUploadSubmissionForm(req.body.signed));
    const claim = await getCaseDataFromStore(claimId);
    await form.validate();

    if (form.hasErrors()) {
      const isSmallClaims = claim.isSmallClaimsTrackDQ;
      renderView(res, form, claim, claimId, isSmallClaims, lang);
    } else {
      await saveUploadedDocuments(claim, <AppRequest>req);
      await deleteDraftClaimFromStore(claimId);
      res.redirect(constructResponseUrlWithIdParams(claim.id, CP_EVIDENCE_UPLOAD_SUBMISSION_URL));
    }
  } catch (error) {
    next(error);
  }

})as RequestHandler);

export default documentUploadCheckAnswerController;
