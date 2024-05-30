import {RequestHandler, Response, Router} from 'express';
import {
  CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL, DASHBOARD_CLAIMANT_URL,
} from 'routes/urls';
import {AppRequest} from 'common/models/AppRequest';
import {
  getConfirmYouHaveBeenPaidConfirmationContent,
} from 'services/features/judgmentOnline/confirmYouHaveBeenPaidConfirmationContents';

const confirmationPageViewPath = 'features/judgmentOnline/judgment-online-confirmation-page.njk';

const confirmYouHaveBeenPaidConfirmController = Router();

function renderView(res: Response, claimId: string) {
  const panel = {
    titleText: 'PAGES.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRM.YOU_CONFIRMED',
  };
  const content = getConfirmYouHaveBeenPaidConfirmationContent(claimId);
  const dashboardUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);

  res.render(confirmationPageViewPath, {
    dashboardUrl,
    pageTitle: 'PAGES.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRM.PAGE_TITLE',
    panel,
    content});
}

confirmYouHaveBeenPaidConfirmController.get(CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL, (async (req: AppRequest, res: Response) => {
  const claimId = req.params.id;
  renderView(res, claimId);
})as RequestHandler);

export default confirmYouHaveBeenPaidConfirmController;
