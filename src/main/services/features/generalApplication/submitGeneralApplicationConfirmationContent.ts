import {Claim} from 'models/claim';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION} from 'routes/urls';

export const getGeneralApplicationConfirmationContent = (async (claimId: string, genAppId: string, claim: Claim, lng: string,) => {
  const applicationFee = convertToPoundsFilter(claim.generalApplication?.applicationFee?.calculatedAmountInPence?.toString());
  const dashboardUrl = await getCancelUrl(claimId, claim);
  let payApplicationFeeUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION);
  payApplicationFeeUrl = genAppId ? payApplicationFeeUrl + `?id=${genAppId}` : payApplicationFeeUrl;
  return new PageSectionBuilder()
    .addTitle('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT')
    .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLICATION_SAVE', {applicationFee})
    .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.UNTIL_PAY_FEE')
    .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLY_HELP_WITH_FEES')
    .addButton(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.PAY_FEE_BUTTON', {lng}), payApplicationFeeUrl)
    .addLink(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.RETURN_CASE_DETAILS', {lng}), dashboardUrl)
    .build();
});
