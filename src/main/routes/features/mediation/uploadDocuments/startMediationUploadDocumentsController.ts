import {NextFunction, RequestHandler, Router} from 'express';
import {
  MEDIATION_TYPE_OF_DOCUMENTS, START_MEDIATION_UPLOAD_FILES,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {
  FinaliseYourTrialSectionBuilder,
} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';

const startMediationUploadFileViewPath = 'features/common/static-page';
const startMediationUploadDocumentsController = Router();
const pageTitle = 'PAGES.FINALISE_TRIAL_ARRANGEMENTS.TITLE';
const MEDIATION_START_PAGE = 'PAGES.MEDIATION.START_PAGE.';
const getContents = (claimId: string, claim: Claim) => {

  return new FinaliseYourTrialSectionBuilder()
    .addMainTitle(`${MEDIATION_START_PAGE}PAGE_TITLE`)
    .addLeadParagraph('COMMON.CASE_REFERENCE', {claimId: caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addParagraph(`${MEDIATION_START_PAGE}YOU_DID_NOT_ATTEND`)
    .addParagraph(`${MEDIATION_START_PAGE}IF_YOU_WERE_UNABLE`)
    .addParagraph(`${MEDIATION_START_PAGE}YOU_CANNOT_WITHDRAW`)
    .addParagraph(`${MEDIATION_START_PAGE}THE_OTHER_PARTIES`)

    .addTitle(`${MEDIATION_START_PAGE}DEADLINES_FOR_UPLOADING_TITLE`)
    .addParagraph(`${MEDIATION_START_PAGE}YOU_HAVE_UNTIL`)
    .addParagraph(`${MEDIATION_START_PAGE}YOU_DO_NOT_HAVE`)

    .addTitle(`${MEDIATION_START_PAGE}BEFORE_YOU_UPLOAD_TITLE`)
    .addParagraph(`${MEDIATION_START_PAGE}BEFORE YOU UPLOAD`)
    .addParagraph(`${MEDIATION_START_PAGE}EACH_DOCUMENT_MUST`)
    .addStartButton('COMMON.BUTTONS.START_NOW', MEDIATION_TYPE_OF_DOCUMENTS.replace(':id', claimId))
    .build();
};

startMediationUploadDocumentsController.get(START_MEDIATION_UPLOAD_FILES, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim: Claim = await getCaseDataFromStore(redisKey);
    res.render(startMediationUploadFileViewPath, {pageTitle: pageTitle, contents: getContents(claimId, claim)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default startMediationUploadDocumentsController;
