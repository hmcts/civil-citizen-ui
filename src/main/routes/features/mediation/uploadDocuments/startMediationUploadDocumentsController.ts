import {NextFunction, RequestHandler, Router} from 'express';
import {
  MEDIATION_TYPE_OF_DOCUMENTS, START_MEDIATION_UPLOAD_FILES,
} from 'routes/urls';
import {Claim} from 'models/claim';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {getClaimById} from 'modules/utilityService';

const startMediationUploadFileViewPath = 'features/common/static-page';
const startMediationUploadDocumentsController = Router();
const MEDIATION_START_PAGE = 'PAGES.MEDIATION.START_PAGE.';
const pageTitle = `${MEDIATION_START_PAGE}PAGE_TITLE`;

const getContents = (claimId: string, claim: Claim) => {

  return new PageSectionBuilder()
    .addMainTitle(`${MEDIATION_START_PAGE}PAGE_TITLE`)
    .addLeadParagraph('COMMON.CASE_REFERENCE', {claimId: caseNumberPrettify(claimId)})
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
    const claim: Claim = await getClaimById(req.params.id, req, true);
    res.render(startMediationUploadFileViewPath, {pageTitle: pageTitle, contents: getContents(claimId, claim)});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default startMediationUploadDocumentsController;
