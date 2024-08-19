import {
  APPLY_HELP_WITH_FEES_REFERENCE,
  DASHBOARD_CLAIMANT_URL,
} from 'routes/urls';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';

export const getHearingFeeStartPageContent = (claimId: string, totalClaimAmount:number, lng: string) => {

  const nextPageUrl = APPLY_HELP_WITH_FEES_REFERENCE.replace(':id', claimId);
  const dashBoardClaimantUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
  return new PageSectionBuilder()
    .addMicroText('PAGES.DASHBOARD.HEARINGS.HEARING')
    .addMainTitle('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(totalClaimAmount)})
    .addParagraph(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_IF', { lng: getLng(lng) }))
    .addParagraph(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_INSTEAD', { lng: getLng(lng) }))
    .addParagraph(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_DURING', { lng: getLng(lng) }))
    .addParagraph(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_ONCE', { lng: getLng(lng) }))
    .addLink(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.LINK', { lng: getLng(lng) }),'https://www.gov.uk/get-help-with-court-fees','','','',true)
    .addButtonWithCancelLink('COMMON.BUTTONS.CONTINUE', nextPageUrl,false, dashBoardClaimantUrl).build();
};
