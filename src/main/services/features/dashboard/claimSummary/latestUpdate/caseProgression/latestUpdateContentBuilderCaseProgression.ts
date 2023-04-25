import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';

const TRIAL_HEARING_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT';
export const buildResponseToClaimSectionCaseProgression = (claim: Claim, claimId: string): ClaimSummarySection[][] => {
  const sectionContent = [];
  let trialHearingTitle;
  let trialHearingParagraph;

  if(claim.isFastTrackClaim){
    trialHearingTitle = `${TRIAL_HEARING_CONTENT}.YOUR_TRIAL_TITLE`;
    trialHearingParagraph = `${TRIAL_HEARING_CONTENT}.YOUR_TRIAL_PARAGRAPH`;
  } else if(claim.isSmallClaimsTrackDQ){
    trialHearingTitle = `${TRIAL_HEARING_CONTENT}.YOUR_HEARING_TITLE`;
    trialHearingParagraph = `${TRIAL_HEARING_CONTENT}.YOUR_HEARING_PARAGRAPH`;
  }

  const section = new LatestUpdateSectionBuilder()
    .addTitle(trialHearingTitle)
    .addParagraph(trialHearingParagraph, {hearingDate: claim.caseProgressionHearing.getHearingDateFormatted() ,
      hearingTimeHourMinute: claim.caseProgressionHearing.getHearingTimeHourMinuteFormatted(),
      courtName: claim.caseProgressionHearing.hearingLocation.getCourtName()})
    .addButton(`${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_BUTTON`, 'href')
    .build();
  sectionContent.push(section);
  return sectionContent;
};
