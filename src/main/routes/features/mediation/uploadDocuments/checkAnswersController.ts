import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  MEDIATION_CONFIRMATION,
  MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND,
} from 'routes/urls';

import {deleteDraftClaimFromStore, generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'common/models/AppRequest';
import {GenericForm} from 'common/form/models/genericForm';
import {documentUploadSubmissionForm} from 'form/models/caseProgression/documentUploadSubmission';
import {getMediationSummarySection} from 'services/features/mediation/uploadDocuments/buildYourStatementSummaryRows';
import {getUploadDocuments} from 'services/features/mediation/uploadDocuments/uploadDocumentsService';
import {UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {
  FinaliseYourTrialSectionBuilder,
} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {saveMediationUploadedDocuments} from "services/features/mediation/uploadDocuments/mediationCheckAnswersService";

const checkAnswersViewPath = 'features/mediation/uploadDocuments/check-answers';
const mediationDocumentUploadCheckAnswerController = Router();

export const getTopElements = (claim:Claim, claimId: string): ClaimSummarySection[] => {

  return new PageSectionBuilder()
    .addMainTitle('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_TITLE')
    .addLeadParagraph('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CASE_REFERENCE_NUMBER', {caseNumber: caseNumberPrettify(claimId)})
    .addLeadParagraph('COMMON.PARTIES', {claimantName: claim.getClaimantFullName(), defendantName: claim.getDefendantFullName()})
    .addInsetText('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_WARNING_FULL')
    .build();
};

export const getBottomElements = (): ClaimSummarySection[] => {

  return new FinaliseYourTrialSectionBuilder()
    .addMainTitle('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_CONFIRMATION')
    .addWarning('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_WARNING_SHORT')
    .build();
};

function renderView(uploadDocuments: UploadDocuments, res: Response, form: GenericForm<documentUploadSubmissionForm>, claim: Claim, claimId: string, lang: string) {
  const topPageContents = getTopElements(claim, claimId);

  const summarySections = getMediationSummarySection(uploadDocuments, claimId, lang);
  const bottomPageContents = getBottomElements();

  res.render(checkAnswersViewPath, {
    form, topPageContents, summarySections, bottomPageContents});
}

mediationDocumentUploadCheckAnswerController.get(MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const uploadDocuments = getUploadDocuments(claim);
    const form = new GenericForm(new documentUploadSubmissionForm());
    renderView(uploadDocuments, res, form, claim, claimId, lang);
  } catch (error) {
    next(error);
  }
})as RequestHandler);

mediationDocumentUploadCheckAnswerController.post(MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND, (async (req: Request | AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const form = new GenericForm(new documentUploadSubmissionForm(req.body.signed));
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const uploadDocuments = getUploadDocuments(claim);
    form.validateSync();
    if (form.hasErrors()) {
      renderView(uploadDocuments, res, form, claim, claimId, lang);
    } else {
      await saveMediationUploadedDocuments(claimId, uploadDocuments, <AppRequest>req);
      await deleteDraftClaimFromStore(redisKey);
      res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_CONFIRMATION));
    }
  } catch (error) {
    next(error);
  }

})as RequestHandler);

export default mediationDocumentUploadCheckAnswerController;
