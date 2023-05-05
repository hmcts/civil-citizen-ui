import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {PartyType} from 'models/partyType';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {FAST_TRACK_CLAIM_AMOUNT, SMALL_CLAIM_AMOUNT} from 'form/models/claimType';
import {getCaseProgressionHearingMock} from '../../../../../../../utils/caseProgression/mockCaseProgressionHearing';
import {
  getHearingTrialLatestUpload,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/hearingTrialLatestUploadContent';
import {DocumentUri} from 'models/document/documentType';

const lang = 'en';
describe('Latest Update Content Builder Case Progression', () => {
  const partyName = 'Mr. John Doe';
  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
  claim.respondent1ResponseDeadline = new Date('2022-07-29T15:59:59');
  claim.applicant1 = {
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      partyName: partyName,
    },
  };
  const TRIAL_HEARING_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT';
  claim.caseProgressionHearing = getCaseProgressionHearingMock();

  describe('test getHearingTrialLatestUpload method', () => {

    it('should have Hearing upload content with small claim amount', () => {
      // Given
      claim.totalClaimAmount = SMALL_CLAIM_AMOUNT;
      const lastedContentBuilderExpected = new LatestUpdateSectionBuilder()
        .addTitle(`${TRIAL_HEARING_CONTENT}.YOUR_HEARING_TITLE`)
        .addParagraph(`${TRIAL_HEARING_CONTENT}.YOUR_HEARING_PARAGRAPH`, {hearingDate: claim.caseProgressionHearing.getHearingDateFormatted(lang) ,
          hearingTimeHourMinute: claim.caseProgressionHearing.getHearingTimeHourMinuteFormatted(),
          courtName: claim.caseProgressionHearing.hearingLocation.getCourtName()})
        .addDocumentButton(`${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_BUTTON`, claim.id, DocumentUri.HEARING_FORM)
        .build();

      // when
      const evidenceUploadSection = getHearingTrialLatestUpload(claim, lang);

      // Then
      expect(evidenceUploadSection).toEqual(lastedContentBuilderExpected);
    });

    it('should have Hearing upload content with fast track', () => {
      // Given
      claim.totalClaimAmount = FAST_TRACK_CLAIM_AMOUNT - 5;
      const lastedContentBuilderExpected = new LatestUpdateSectionBuilder()
        .addTitle(`${TRIAL_HEARING_CONTENT}.YOUR_TRIAL_TITLE`)
        .addParagraph(`${TRIAL_HEARING_CONTENT}.YOUR_TRIAL_PARAGRAPH`, {hearingDate: claim.caseProgressionHearing.getHearingDateFormatted(lang) ,
          hearingTimeHourMinute: claim.caseProgressionHearing.getHearingTimeHourMinuteFormatted(),
          courtName: claim.caseProgressionHearing.hearingLocation.getCourtName()})
        .addDocumentButton(`${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_BUTTON`, claim.id, DocumentUri.HEARING_FORM)
        .build();

      // when
      const evidenceUploadSection = getHearingTrialLatestUpload(claim, lang);

      // Then
      expect(evidenceUploadSection).toEqual(lastedContentBuilderExpected);
    });
  });

});
