import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {Claim} from 'models/claim';
import {HearingDateTimeFormatter} from "services/features/caseProgression/hearingDateTimeFormatter";
import {convertToPoundsFilter} from "common/utils/currencyFormat";

const CASE_DISMISSED_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE';

export const getClaimDismissedHearingDueDateUploadContent = (claim: Claim, lang: string, isClaimant: boolean) => {
  const claimDismissedTitle = `${CASE_DISMISSED_CONTENT}.TITLE`;

  const claimDismissedWarning = isClaimant
    ? `${CASE_DISMISSED_CONTENT}.CLAIMANT_WARNING`
    : `${CASE_DISMISSED_CONTENT}.DEFENDANT_WARNING`;

  const claimDismissedParagraph = isClaimant
    ? `${CASE_DISMISSED_CONTENT}.CLAIMANT_PARAGRAPH`
    : `${CASE_DISMISSED_CONTENT}.DEFENDANT_PARAGRAPH`;

  const hearingDate = HearingDateTimeFormatter.getHearingDateFormatted(claim.caseProgressionHearing.hearingDate, lang);
  const hearingTime = HearingDateTimeFormatter.getHearingTimeHourMinuteFormatted(claim.caseProgressionHearing.hearingTimeHourMinute);
  const hearingFee = convertToPoundsFilter(claim.hearingFee?.calculatedAmountInPence?.toString());

  const latestUpdateSectionBuilder = new LatestUpdateSectionBuilder()
    .addTitle(claimDismissedTitle)
    .addWarning(claimDismissedWarning, { hearingDate, hearingTime })
    .addParagraph(claimDismissedParagraph, { hearingFee })

  if (isClaimant) {
    latestUpdateSectionBuilder.addLatestUpdateClaimantParagraph(lang);
  }

  return latestUpdateSectionBuilder.build();
};

