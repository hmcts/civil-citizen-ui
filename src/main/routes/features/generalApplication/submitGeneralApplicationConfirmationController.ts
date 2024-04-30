import {NextFunction, RequestHandler, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  GENERAL_APPLICATION_CONFIRM_URL,
} from 'routes/urls';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {Claim} from 'models/claim';

const submitGeneralApplicationConfirmationViewPath = 'features/generalApplication/submit-general-application-confirmation';
const submitGeneralApplicationConfirmationController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const getGeneralApplicationConfirmationContent = (claimId: string, claim: Claim, lng: string) => {

  // Need to change after getting the application fee based on the scenarios
  const applicationFee = '#';

  const dashboardUrl = claim.isClaimant()
    ? DASHBOARD_CLAIMANT_URL.replace(':id', claimId)
    : DEFENDANT_SUMMARY_URL.replace(':id', claimId);

  return new PageSectionBuilder()
    .addTitle('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT')
    .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLICATION_SAVE', {applicationFee})
    .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.UNTIL_PAY_FEE')
    .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLY_HELP_WITH_FEES')
    .addButton(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.PAY_FEE_BUTTON', {lng}), '#')
    .addLink(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.RETURN_CASE_DETAILS', {lng}), dashboardUrl)
    .build();
};

submitGeneralApplicationConfirmationController.get(GENERAL_APPLICATION_CONFIRM_URL, (async (req, res, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    res.render(submitGeneralApplicationConfirmationViewPath, {
      confirmationTitle : t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.TITLE', {lng}),
      confirmationContent: getGeneralApplicationConfirmationContent(claimId, claim, lng),
    });
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default submitGeneralApplicationConfirmationController;
