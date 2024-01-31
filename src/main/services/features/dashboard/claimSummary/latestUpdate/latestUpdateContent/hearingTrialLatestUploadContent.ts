import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {Claim} from 'models/claim';
import {DocumentType} from 'models/document/documentType';
import {CASE_DOCUMENT_VIEW_URL, DEFENDANT_SUMMARY_TAB_URL} from 'routes/urls';
import {getHearingDocumentsCaseDocumentIdByType} from 'models/caseProgression/caseProgressionHearing';
import {TabId} from 'routes/tabs';

const TRIAL_HEARING_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT';

export const getHearingTrialLatestUpload = (claim: Claim, lang: string) => {
  const trialHearingTitle = claim.isFastTrackClaim
    ? `${TRIAL_HEARING_CONTENT}.YOUR_TRIAL_TITLE`
    : `${TRIAL_HEARING_CONTENT}.YOUR_HEARING_TITLE`;

  const trialHearingParagraph = claim.isFastTrackClaim
    ? `${TRIAL_HEARING_CONTENT}.YOUR_TRIAL_PARAGRAPH`
    : `${TRIAL_HEARING_CONTENT}.YOUR_HEARING_PARAGRAPH`;

  const keepContactDetaislUpToDate = `${TRIAL_HEARING_CONTENT}.KEEP_CONTACT_DETAILS_UP_TO_DATE`;

  const noticesAndOrdersBeforeText = `${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_BEFORE`;
  const noticesAndOrdersLinkText = `${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_LINK`;
  const noticesAndOrdersAfterText = `${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_AFTER`;

  const hearingDate = claim.caseProgressionHearing.getHearingDateFormatted(lang);
  const hearingTimeHourMinute = claim.caseProgressionHearing.getHearingTimeHourMinuteFormatted();
  const courtName = claim.caseProgressionHearing.hearingLocation.getCourtName();

  const latestUpdateSectionBuilder = new LatestUpdateSectionBuilder()
    .addTitle(trialHearingTitle)
    .addParagraph(trialHearingParagraph, { hearingDate, hearingTimeHourMinute, courtName })
    .addParagraph(keepContactDetaislUpToDate)
    .addLink(noticesAndOrdersLinkText,DEFENDANT_SUMMARY_TAB_URL.replace(':id', claim.id).replace(':tab', TabId.NOTICES),noticesAndOrdersBeforeText, noticesAndOrdersAfterText)
    .addButtonOpensNewTab(`${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_BUTTON`,  CASE_DOCUMENT_VIEW_URL.replace(':id', claim.id).replace(':documentId', getHearingDocumentsCaseDocumentIdByType(claim.caseProgressionHearing.hearingDocuments, DocumentType.HEARING_FORM)));

  return latestUpdateSectionBuilder.build();
};

