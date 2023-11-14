import {DASHBOARD_CLAIMANT_URL, HEARING_FEE_APPLY_HELP_FEE_SELECTION} from 'routes/urls';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
export const getHearingFeeStartPageContent = (claimId: string, lang:string, hearingFeeInformation: HearingFeeInformation) => {

  const nextPageUrl = HEARING_FEE_APPLY_HELP_FEE_SELECTION.replace(':id', claimId);
  const dashBoardClaimantUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
  return new PageSectionBuilder()
    .addMicroText('COMMON.MICRO_TEXT.HEARING_FEE')
    .addMainTitle('PAGES.PAY_HEARING_FEE.START_PAGE.TITLE')
    .addParagraph('PAGES.PAY_HEARING_FEE.START_PAGE.YOU_MUST_PAY', {
      hearingFee: hearingFeeInformation.getHearingFeeFormatted(),
      hearingDueDate:hearingFeeInformation.getHearingDueDateFormatted(lang),
    })
    .addParagraph('PAGES.PAY_HEARING_FEE.START_PAGE.IF_YOU_DO_NOT_PAY')
    .addButtonWithCancelLink('COMMON.BUTTONS.START_NOW', nextPageUrl,true, dashBoardClaimantUrl).build();
};
