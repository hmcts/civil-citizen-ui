import {DASHBOARD_CLAIMANT_URL, HEARING_FEE_APPLY_HELP_FEE_SELECTION} from 'routes/urls';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {t} from 'i18next';
export const getHearingFeeStartPageContent = (claimId: string, lng:string, totalClaimAmount:number,hearingFeeInformation: HearingFeeInformation) => {

  const nextPageUrl = HEARING_FEE_APPLY_HELP_FEE_SELECTION.replace(':id', claimId);
  const dashBoardClaimantUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
  return new PageSectionBuilder()
    .addMicroText('PAGES.DASHBOARD.HEARINGS.HEARING')
    .addMainTitle('PAGES.PAY_HEARING_FEE.START_PAGE.TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(totalClaimAmount)})
    .addParagraph(t('PAGES.PAY_HEARING_FEE.START_PAGE.YOU_MUST_PAY',{lng}), {
      hearingFee: hearingFeeInformation.getHearingFeeFormatted(),
      hearingDueDate:hearingFeeInformation.getHearingDueDateFormatted(lng),
    })
    .addParagraph(t('PAGES.PAY_HEARING_FEE.START_PAGE.IF_YOU_DO_NOT_PAY', {lng}))
    .addButtonWithCancelLink('COMMON.BUTTONS.START_NOW', nextPageUrl,true, dashBoardClaimantUrl).build();
};
