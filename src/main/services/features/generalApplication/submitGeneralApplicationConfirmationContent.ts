import {Claim} from 'models/claim';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GA_APPLY_HELP_WITH_FEE_SELECTION} from 'routes/urls';

export const getGeneralApplicationConfirmationContent = (async (claimId: string, claim: Claim, lng: string, applicationFee: number) => {
  const dashboardUrl = await getCancelUrl(claimId, claim);
  const payApplicationFeeUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEE_SELECTION);

  return new PageSectionBuilder()
    .addTitle('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT')
    .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLICATION_SAVE', {applicationFee})
    .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.UNTIL_PAY_FEE')
    .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLY_HELP_WITH_FEES')
    .addButton(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.PAY_FEE_BUTTON', {lng}), payApplicationFeeUrl)
    .addLink(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.RETURN_CASE_DETAILS', {lng}), dashboardUrl)
    .build();
});
