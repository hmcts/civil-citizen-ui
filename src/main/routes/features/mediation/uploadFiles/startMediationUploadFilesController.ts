import {NextFunction, RequestHandler, Router} from 'express';
import {
  CASE_DOCUMENT_DOWNLOAD_URL,
  IS_CASE_READY_URL, START_MEDIATION_UPLOAD_FILES,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {
  FinaliseYourTrialSectionBuilder,
} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';

const startMediationUploadFileViewPath = 'features/common/static-page';
const startMediationUploadFilesController = Router();
const pageTitle = 'PAGES.FINALISE_TRIAL_ARRANGEMENTS.TITLE';
const MEDIATION_START_PAGE = 'PAGES.MEDIATION.START_PAGE';
const getContents = (claimId: string, claim: Claim) => {

  return new FinaliseYourTrialSectionBuilder()
    .addMainTitle('PAGES.FINALISE_TRIAL_ARRANGEMENTS.TITLE')
    .addLeadParagraph('COMMON.CASE_REFERENCE', {claimId: caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_SHOULD_FINALISE')
    .addTitle('PAGES.FINALISE_TRIAL_ARRANGEMENTS.IS_THE_CASE_READY_FOR_TRIAL')
    .addLink('PAGES.FINALISE_TRIAL_ARRANGEMENTS.DIRECTIONS_ORDER', CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.SDO_ORDER)),
      'PAGES.FINALISE_TRIAL_ARRANGEMENTS.WE_ARE_ASKING_YOU',
      'PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_HAVE_RECEIVED','', true)
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.IF_YOUR_CASE_NOT_READY')
    .addCustomInsetText('PAGES.FINALISE_TRIAL_ARRANGEMENTS.IF_YOU_NEED_TO_MAKE_APPLICATION','PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_SHOULD_ONLY_MAKE_AN_APPLICATION','PAGES.FINALISE_TRIAL_ARRANGEMENTS.IF_YOU_MAKE_APPLICATION')
    .addTitle('PAGES.FINALISE_TRIAL_ARRANGEMENTS.HEARING_ADJUSTMENTS_AND_DURATION')
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.WE_WILL_REMIND_YOU')
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.IF_YOU_FEEL_THAT')
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.YOU_SHOULD_ONLY_MAKE_APPLICATION')
    .addTitle('PAGES.FINALISE_TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TITLE')
    .addParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TEXT')
    .addStartButton('PAGES.FINALISE_TRIAL_ARRANGEMENTS.START_NOW', IS_CASE_READY_URL.replace(':id', claim.id))
    .build();
};

startMediationUploadFilesController.get(START_MEDIATION_UPLOAD_FILES, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim: Claim = await getCaseDataFromStore(redisKey);
    res.render(startMediationUploadFileViewPath, {pageTitle: pageTitle, contents:getContents(claimId, claim)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default startMediationUploadFilesController;
