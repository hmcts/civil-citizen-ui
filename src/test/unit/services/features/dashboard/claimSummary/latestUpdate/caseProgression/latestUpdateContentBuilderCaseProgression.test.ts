import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {PartyType} from 'models/partyType';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {
  buildEvidenceUploadSection, buildHearingTrialLatestUploadSection, buildViewBundleSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {FAST_TRACK_CLAIM_AMOUNT, SMALL_CLAIM_AMOUNT} from 'form/models/claimType';
import {getCaseProgressionHearingMock} from '../../../../../../../utils/caseProgression/mockCaseProgressionHearing';
import {
  SystemGeneratedCaseDocumentsWithSEALEDCLAIMAndSDOMock,
} from '../../../../../../../utils/mocks/SystemGeneratedCaseDocumentsMock';

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
  claim.systemGeneratedCaseDocuments = SystemGeneratedCaseDocumentsWithSEALEDCLAIMAndSDOMock();
  const sdoUrl = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claim.id).replace(':documentId', '123');

  describe('test buildEvidenceUploadSection', () => {
    it('should have evidence upload content with bundle deadline', () => {
      // Given
      claim.caseProgressionHearing.hearingDate = new Date();
      // when
      const evidenceUploadSection = buildEvidenceUploadSection(claim);
      // Then
      expect(evidenceUploadSection[0].length).toBe(6);
      expect(evidenceUploadSection[0][0].type).toEqual(ClaimSummaryType.TITLE);
      expect(evidenceUploadSection[0][0].data?.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
      expect(evidenceUploadSection[0][1].type).toEqual(ClaimSummaryType.WARNING);
      expect(evidenceUploadSection[0][2].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(evidenceUploadSection[0][3].type).toEqual(ClaimSummaryType.LINK);
      expect(evidenceUploadSection[0][3].data?.href).toEqual(sdoUrl);
      expect(evidenceUploadSection[0][4].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(evidenceUploadSection[0][4].data?.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.DOCUMENTS_SUBMITTED_NOT_CONSIDERED');
      expect(evidenceUploadSection[0][5].type).toEqual(ClaimSummaryType.BUTTON);
      expect(evidenceUploadSection[0][5].data?.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
    });

  });

  describe('test buildHearingTrialLatestUploadSection', () => {
    const TRIAL_HEARING_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT';
    claim.caseProgressionHearing = getCaseProgressionHearingMock();

    it('should have Hearing upload content with fast track claim', () => {
      // Given
      claim.totalClaimAmount = SMALL_CLAIM_AMOUNT;

      const lastedContentBuilderExpected = new LatestUpdateSectionBuilder()
        .addTitle(`${TRIAL_HEARING_CONTENT}.YOUR_HEARING_TITLE`)
        .addParagraph(`${TRIAL_HEARING_CONTENT}.YOUR_HEARING_PARAGRAPH`, {hearingDate: claim.caseProgressionHearing.getHearingDateFormatted(lang) ,
          hearingTimeHourMinute: claim.caseProgressionHearing.getHearingTimeHourMinuteFormatted(),
          courtName: claim.caseProgressionHearing.hearingLocation.getCourtName()})
        .addButton(`${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_BUTTON`, 'href')
        .build();

      // when
      const evidenceUploadSection = buildHearingTrialLatestUploadSection(claim, lang);

      // Then
      expect(evidenceUploadSection).toEqual([lastedContentBuilderExpected]);
    });

    it('should have Hearing upload content with fast track', () => {
      // Given
      claim.totalClaimAmount = FAST_TRACK_CLAIM_AMOUNT - 5;
      const lastedContentBuilderExpected = new LatestUpdateSectionBuilder()
        .addTitle(`${TRIAL_HEARING_CONTENT}.YOUR_TRIAL_TITLE`)
        .addParagraph(`${TRIAL_HEARING_CONTENT}.YOUR_TRIAL_PARAGRAPH`, {hearingDate: claim.caseProgressionHearing.getHearingDateFormatted(lang) ,
          hearingTimeHourMinute: claim.caseProgressionHearing.getHearingTimeHourMinuteFormatted(),
          courtName: claim.caseProgressionHearing.hearingLocation.getCourtName()})
        .addButton(`${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_BUTTON`, 'href')
        .build();

      // when
      const evidenceUploadSection = buildHearingTrialLatestUploadSection(claim, lang);

      // Then
      expect(evidenceUploadSection).toEqual([lastedContentBuilderExpected]);
    });
  });

  describe('test buildViewBundleSection method', () => {
    const BUNDLE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.BUNDLE';

    it('should have view bundle content', () => {
      //Given
      const viewBundleContentExpected: ClaimSummarySection[] = new LatestUpdateSectionBuilder()
        .addTitle(`${BUNDLE_CONTENT}.TITLE`)
        .addParagraph(`${BUNDLE_CONTENT}.BUNDLE_CONTAINS_ALL_DOCUMENTS`)
        .addParagraph(`${BUNDLE_CONTENT}.YOU_ARE_REMINDED`)
        .addButton(`${BUNDLE_CONTENT}.VIEW_BUNDLE`, 'href') // TODO - add an actual href once available after work on CIV-9800 is done;
        .build();

      //When
      const viewBundleContent = buildViewBundleSection();

      //Then
      expect(viewBundleContent).toEqual([viewBundleContentExpected]);
    });
  });

});
