import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';

export const getConfirmYouHaveBeenPaidConfirmationContent = (claimId: string): ClaimSummarySection[] => {
  const claimantDashboardUrl = constructResponseUrlWithIdParams(claimId,DASHBOARD_CLAIMANT_URL);
  return new PageSectionBuilder()
    .addTitle('PAGES.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRM.WHAT_NEXT')
    .addParagraph('PAGES.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRM.NO_FURTHER')
    .addRawHtml('<br>')
    .addButton('PAGES.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRM.CLOSE_AND_RETURN', claimantDashboardUrl)
    .build();
};
