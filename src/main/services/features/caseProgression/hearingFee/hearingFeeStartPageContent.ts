import {Claim} from 'models/claim';
import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {hearingFeePageBuilder} from "models/caseProgression/hearingFee/hearingFeePageBuilder";
import {CaseProgressionHearing} from "models/caseProgression/caseProgressionHearing";
import {HearingFeeInformation} from "models/caseProgression/hearingFee";
export const getHearingFeeStartPageContent = (claimId: string, lang:string, hearingFeeInformation: HearingFeeInformation) => {

  const startHref = HEARING_FEE_APPLY_HELP_FEE_SELECTION.replace(':id', claimId);
  const cancelHref = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
  return new hearingFeePageBuilder()
    .addMicroText('PAGES.PAY_HEARING_FEE.START.MICRO_TEXT')
    .addMainTitle('PAGES.PAY_HEARING_FEE.START.TITLE')
    .addParagraph('PAGES.PAY_HEARING_FEE.START.YOU_MUST_PAY', {
      hearingFee: hearingFeeInformation.getHearingFeeFormatted(),
      hearingDueDate:hearingFeeInformation.getHearingDueDateFormatted(lang)
    })
    .addParagraph('PAGES.PAY_HEARING_FEE.START.IF_YOU_DO_NOT_PAY')
    .addStartButtonWithLink('PAGES.PAY_HEARING_FEE.START.START_NOW', startHref, cancelHref).build();
};
