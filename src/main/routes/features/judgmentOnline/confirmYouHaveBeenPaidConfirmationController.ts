import {RequestHandler, Response, Router} from 'express';
import {
  CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL, DASHBOARD_CLAIMANT_URL,
} from 'routes/urls';

import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'common/models/AppRequest';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

const confirmationPageViewPath = 'features/judgmentOnline/judgment-online-confirmation-page.njk';

const confirmYouHaveBeenPaidConfirmController = Router();
export const getContent = (claimId: string): ClaimSummarySection[] => {
  const claimantDashboardUrl = constructResponseUrlWithIdParams(claimId,DASHBOARD_CLAIMANT_URL);
  return new PageSectionBuilder()
    .addTitle('PAGES.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRM.WHAT_NEXT')
    .addParagraph('PAGES.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRM.NO_FURTHER')
    .addRawHtml('<br>')
    .addButton('PAGES.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRM.CLOSE_AND_RETURN', claimantDashboardUrl)
    .build();
};

function renderView(res: Response, claimId: string) {
  const panel = {
    titleText: 'PAGES.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRM.YOU_CONFIRMED',
  };
  const content = getContent(claimId);

  res.render(confirmationPageViewPath, {
    pageTitle: 'PAGES.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRM.PAGE_TITLE',
    panel,
    content});
}

confirmYouHaveBeenPaidConfirmController.get(CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL, (async (req: AppRequest, res: Response) => {
  const claimId = req.params.id;
  renderView(res, claimId);
})as RequestHandler);

export default confirmYouHaveBeenPaidConfirmController;
