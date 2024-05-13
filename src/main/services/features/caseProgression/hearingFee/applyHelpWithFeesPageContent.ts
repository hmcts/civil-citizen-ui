import {
  APPLY_HELP_WITH_FEES_REFERENCE,
  DASHBOARD_CLAIMANT_URL,
} from 'routes/urls';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

export const getHearingFeeStartPageContent = (claimId: string, totalClaimAmount:number) => {

  const nextPageUrl = APPLY_HELP_WITH_FEES_REFERENCE.replace(':id', claimId);
  const dashBoardClaimantUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
  return new PageSectionBuilder()
    .addMicroText('PAGES.DASHBOARD.HEARINGS.HEARING')
    .addMainTitle('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(totalClaimAmount)})
    .addParagraph('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_IF')
    .addParagraph('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_INSTEAD')
    .addParagraph('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_DURING')
    .addParagraph('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_ONCE')
    .addLink('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.LINK','https://www.gov.uk/get-help-with-court-fees','','','',true)
    .addButtonWithCancelLink('COMMON.BUTTONS.CONTINUE', nextPageUrl,false, dashBoardClaimantUrl).build();

};
