import {NextFunction, RequestHandler, Router} from 'express';
import {
  IS_CASE_READY_URL, START_MEDIATION_UPLOAD_FILES,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {
  FinaliseYourTrialSectionBuilder,
} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';

const startMediationUploadFileViewPath = 'features/common/static-page';
const startMediationUploadFilesController = Router();
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
    .addParagraph(`${MEDIATION_START_PAGE}CHECK_THE_ORDER_P1`)
    .addParagraph(`${MEDIATION_START_PAGE}YOU_CANNOT_WITHDRAW`)
    .addParagraph(`${MEDIATION_START_PAGE}THE_OTHER_PARTIES`)
    .addTitle(`${MEDIATION_START_PAGE}DEADLINES_FOR_UPLOADING_REPRESENTATION`)
    .addParagraph(`${MEDIATION_START_PAGE}CHECK_THE_ORDER_P2`)
    .addParagraph(`${MEDIATION_START_PAGE}AFTER_THE_DEADLINE`)
    .addParagraph(`${MEDIATION_START_PAGE}YOU_DO_NOT_HAVE`)
    .addTitle(`${MEDIATION_START_PAGE}BEFORE_YOU_UPLOAD_TITLE`)
    .addParagraph(`${MEDIATION_START_PAGE}BEFORE_YOU_UPLOAD`)
    .addParagraph(`${MEDIATION_START_PAGE}EACH_DOCUMENT_MUST`)
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

startMediationUploadFilesController.post(START_MEDIATION_UPLOAD_FILES, (async (req, res, next: NextFunction) => {
  try {
    //todo create a new mediation object and save it to the store
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default startMediationUploadFilesController;
