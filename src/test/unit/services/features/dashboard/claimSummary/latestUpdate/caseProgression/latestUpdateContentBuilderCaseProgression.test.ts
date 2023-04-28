import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {PartyType} from 'models/partyType';
import {DocumentType, DocumentUri} from 'models/document/documentType';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {
  buildEvidenceUploadSection, buildHearingTrialLatestUploadSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {
  CaseProgressionHearing,
  CaseProgressionHearingDocuments,
  HearingLocation,
} from 'models/caseProgression/caseProgressionHearing';
import {FIXED_DATE, FIXED_TIME_HOUR_MINUTE} from '../../../../../../../utils/dateUtils';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {FAST_TRACK_CLAIM_AMOUNT, SMALL_CLAIM_AMOUNT} from 'form/models/claimType';

jest.mock('../../../../../../../../main/modules/i18n/languageService', ()=> ({
  setLanguage: jest.fn(),
  getLanguage: jest.fn(),
}));

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
  const sdoUrl = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claim.id).replace(':documentType', DocumentUri.SDO_ORDER);

  describe('test buildEvidenceUploadSection', () => {
    it('should have evidence upload content', () => {
      // Given
      claim.sdoOrderDocument = {
        createdBy: '',
        createdDatetime: undefined,
        documentLink: undefined,
        documentName: '',
        documentSize: 0,
        documentType: undefined,
      };
      // when
      const evidenceUploadSection = buildEvidenceUploadSection(claim);
      // Then
      expect(evidenceUploadSection[0].length).toBe(4);
      expect(evidenceUploadSection[0][0].type).toEqual(ClaimSummaryType.TITLE);
      expect(evidenceUploadSection[0][0].data?.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
      expect(evidenceUploadSection[0][1].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(evidenceUploadSection[0][2].type).toEqual(ClaimSummaryType.LINK);
      expect(evidenceUploadSection[0][2].data?.href).toEqual(sdoUrl);
      expect(evidenceUploadSection[0][3].type).toEqual(ClaimSummaryType.BUTTON);
      expect(evidenceUploadSection[0][3].data?.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
    });
  });
  describe('test buildHearingTrialLatestUploadSection', () => {
    const TRIAL_HEARING_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT';
    const hearingLocation = new HearingLocation({code: '1', label: 'test - test'});
    const caseProgressionHeringDocuments = getCaseProgressionHearingDocuments();
    claim.caseProgressionHearing = new CaseProgressionHearing(
      caseProgressionHeringDocuments,
      hearingLocation,
      FIXED_DATE,
      FIXED_TIME_HOUR_MINUTE);

    it('should have Hearing upload content with fast track claim', () => {
      // Given
      claim.totalClaimAmount = SMALL_CLAIM_AMOUNT;

      const lastedContentBuilderExpected = new LatestUpdateSectionBuilder()
        .addTitle(`${TRIAL_HEARING_CONTENT}.YOUR_HEARING_TITLE`)
        .addParagraph(`${TRIAL_HEARING_CONTENT}.YOUR_HEARING_PARAGRAPH`, {hearingDate: claim.caseProgressionHearing.getHearingDateFormatted() ,
          hearingTimeHourMinute: claim.caseProgressionHearing.getHearingTimeHourMinuteFormatted(),
          courtName: claim.caseProgressionHearing.hearingLocation.getCourtName()})
        .addButton(`${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_BUTTON`, 'href')
        .build();

      // when
      const evidenceUploadSection = buildHearingTrialLatestUploadSection(claim);

      // Then
      expect(evidenceUploadSection).toEqual([lastedContentBuilderExpected]);
    });
    it('should have Hearing upload content with fast track', () => {
      // Given
      claim.totalClaimAmount = FAST_TRACK_CLAIM_AMOUNT - 5;
      const lastedContentBuilderExpected = new LatestUpdateSectionBuilder()
        .addTitle(`${TRIAL_HEARING_CONTENT}.YOUR_TRIAL_TITLE`)
        .addParagraph(`${TRIAL_HEARING_CONTENT}.YOUR_TRIAL_PARAGRAPH`, {hearingDate: claim.caseProgressionHearing.getHearingDateFormatted() ,
          hearingTimeHourMinute: claim.caseProgressionHearing.getHearingTimeHourMinuteFormatted(),
          courtName: claim.caseProgressionHearing.hearingLocation.getCourtName()})
        .addButton(`${TRIAL_HEARING_CONTENT}.VIEW_HEARING_NOTICE_BUTTON`, 'href')
        .build();

      // when
      const evidenceUploadSection = buildHearingTrialLatestUploadSection(claim);

      // Then
      expect(evidenceUploadSection).toEqual([lastedContentBuilderExpected]);
    });
  });

  function getCaseProgressionHearingDocuments() {
    const caseProgressionHearingDocuments = new CaseProgressionHearingDocuments();
    caseProgressionHearingDocuments.id = '1221';
    caseProgressionHearingDocuments.value = {
      'createdBy': 'Civil',
      'documentLink': {
        'document_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6',
        'document_filename': 'hearing_small_claim_000MC110.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary',
      },
      'documentName': 'hearing_small_claim_000MC110.pdf',
      'documentSize': 56461,
      documentType: DocumentType.HEARING_FORM,
      createdDatetime: new Date('2022-06-21T14:15:19'),
    };
    return [caseProgressionHearingDocuments];
  }
});
