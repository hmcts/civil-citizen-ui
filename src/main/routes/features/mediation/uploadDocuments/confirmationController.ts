import {RequestHandler, Response, Router} from 'express';
import {
  MEDIATION_UPLOAD_DOCUMENTS_CONFIRMATION,
  START_MEDIATION_UPLOAD_FILES, VIEW_MEDIATION_DOCUMENTS,
} from 'routes/urls';

import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'common/models/AppRequest';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';

const checkAnswersViewPath = 'features/common/confirmation-page.njk';

const mediationConfirmationController = Router();
const MEDIATION_CONFIRMATION_PAGE = 'PAGES.MEDIATION.CONFIRMATION_PAGE.';
export const getContent = (claimId: string): ClaimSummarySection[] => {
  const startMediationUploadUrl = constructResponseUrlWithIdParams(claimId,START_MEDIATION_UPLOAD_FILES);
  const viewMediationDocumentsUrl = constructResponseUrlWithIdParams(claimId,VIEW_MEDIATION_DOCUMENTS);

  return new PageSectionBuilder()
    .addLink(`${MEDIATION_CONFIRMATION_PAGE}LINK_TEXT`,
      startMediationUploadUrl,
      `${MEDIATION_CONFIRMATION_PAGE}TEXT_BEFORE`,`${MEDIATION_CONFIRMATION_PAGE}TEXT_AFTER`)
    .addButton('COMMON.VIEW_DOCUMENTS', viewMediationDocumentsUrl)
    .build();
};

function renderView(res: Response, claimId: string) {
  const panel = {
    titleText: 'COMMON.DOCUMENTS_UPLOADED',
  };
  const content = getContent(claimId);

  res.render(checkAnswersViewPath, {
    pageTitle: `${MEDIATION_CONFIRMATION_PAGE}PAGE_TITLE`,
    claimNumber: caseNumberPrettify(claimId),
    panel,
    content});
}

mediationConfirmationController.get(MEDIATION_UPLOAD_DOCUMENTS_CONFIRMATION, (async (req: AppRequest, res: Response) => {
  const claimId = req.params.id;
  renderView(res, claimId);
})as RequestHandler);

export default mediationConfirmationController;
