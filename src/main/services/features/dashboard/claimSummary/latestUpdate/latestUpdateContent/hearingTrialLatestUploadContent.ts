import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {Claim} from 'models/claim';

const TRIAL_HEARING_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT';

export const getHearingTrialLatestUpload = (claim: Claim, lang: string) => {
  const trialHearingTitle = claim.isFastTrackClaim
    ? `${TRIAL_HEARING_CONTENT}.YOUR_TRIAL_TITLE`
    : `${TRIAL_HEARING_CONTENT}.YOUR_HEARING_TITLE`;

  const trialHearingParagraph = claim.isFastTrackClaim
    ? `${TRIAL_HEARING_CONTENT}.YOUR_TRIAL_PARAGRAPH`
    : `${TRIAL_HEARING_CONTENT}.YOUR_HEARING_PARAGRAPH`;

  const hearingDate = claim.caseProgressionHearing.getHearingDateFormatted(lang);
  const hearingTimeHourMinute = claim.caseProgressionHearing.getHearingTimeHourMinuteFormatted();
  const courtName = claim.caseProgressionHearing.hearingLocation.getCourtName();

  const latestUpdateSectionBuilder = new LatestUpdateSectionBuilder()
    .addTitle(trialHearingTitle)
    .addParagraph(trialHearingParagraph, { hearingDate, hearingTimeHourMinute, courtName })
    .addButton(`${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_BUTTON`, 'href');

  return latestUpdateSectionBuilder.build();
};

