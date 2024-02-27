import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {Claim} from 'models/claim';
import {HearingDateTimeFormatter} from 'services/features/caseProgression/hearingDateTimeFormatter';

const CASE_DISMISSED_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE';

export const getClaimDismissedHearingDueDateUploadContent = (claim: Claim, lang: string) => {
  const claimDismissedTitle = `${CASE_DISMISSED_CONTENT}.TITLE`;

  const claimDismissedWarning = `${CASE_DISMISSED_CONTENT}.DEFENDANT_WARNING`;

  const claimDismissedParagraph = `${CASE_DISMISSED_CONTENT}.DEFENDANT_PARAGRAPH`;

  const hearingDate = HearingDateTimeFormatter.getHearingDateFormatted(claim.caseProgressionHearing.hearingDate, lang);
  const hearingTime = HearingDateTimeFormatter.getHearingTimeHourMinuteFormatted(claim.caseProgressionHearing.hearingTimeHourMinute);

  const latestUpdateSectionBuilder = new LatestUpdateSectionBuilder()
    .addTitle(claimDismissedTitle)
    .addWarning(claimDismissedWarning, { hearingDate, hearingTime })
    .addParagraph(claimDismissedParagraph);

  return latestUpdateSectionBuilder.build();
};

