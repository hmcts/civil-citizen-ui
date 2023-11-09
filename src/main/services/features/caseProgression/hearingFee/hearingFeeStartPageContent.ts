import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
export const getHearingFeeStartPageContent = (claimId: string, lang:string, hearingFeeInformation: HearingFeeInformation) => {

  const startHref = HEARING_FEE_APPLY_HELP_FEE_SELECTION.replace(':id', claimId);
  const cancelHref = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
  return new PageSectionBuilder()
    .addMicroText('PAGES.PAY_HEARING_FEE.START.MICRO_TEXT')
    .addMainTitle('PAGES.PAY_HEARING_FEE.START.TITLE')
    .addParagraph('PAGES.PAY_HEARING_FEE.START.YOU_MUST_PAY', {
      hearingFee: hearingFeeInformation.getHearingFeeFormatted(),
      hearingDueDate:hearingFeeInformation.getHearingDueDateFormatted(lang),
    })
    .addParagraph('PAGES.PAY_HEARING_FEE.START.IF_YOU_DO_NOT_PAY')
    .addButtonWithCancelLink('PAGES.PAY_HEARING_FEE.START.START_NOW', startHref,true, cancelHref).build();
};
