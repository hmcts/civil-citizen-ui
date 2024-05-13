import {DASHBOARD_CLAIMANT_URL, HEARING_FEE_APPLY_HELP_FEE_SELECTION} from 'routes/urls';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
export const getHearingFeeStartPageContent = (claimId: string, lang:string, totalClaimAmount:number,hearingFeeInformation: HearingFeeInformation) => {

  const nextPageUrl = HEARING_FEE_APPLY_HELP_FEE_SELECTION.replace(':id', claimId);
  const dashBoardClaimantUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
  return new PageSectionBuilder()
    .addMicroText('COMMON.MICRO_TEXT.HEARING_FEE')
    .addMainTitle('PAGES.PAY_HEARING_FEE.START_PAGE.TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(totalClaimAmount)})
    .addParagraph('PAGES.PAY_HEARING_FEE.START_PAGE.YOU_MUST_PAY', {
      hearingFee: hearingFeeInformation.getHearingFeeFormatted(),
      hearingDueDate:hearingFeeInformation.getHearingDueDateFormatted(lang),
    })
    .addParagraph('PAGES.PAY_HEARING_FEE.START_PAGE.IF_YOU_DO_NOT_PAY')
    .addButtonWithCancelLink('COMMON.BUTTONS.START_NOW', nextPageUrl,true, dashBoardClaimantUrl).build();
};
