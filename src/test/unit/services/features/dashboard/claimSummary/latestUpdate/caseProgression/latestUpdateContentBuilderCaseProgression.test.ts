import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {PartyType} from 'models/partyType';
import {DocumentUri} from 'models/document/documentType';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {
  buildEvidenceUploadSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';
import {ClaimSummaryType} from 'form/models/claimSummarySection';

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
      expect(evidenceUploadSection.length).toBe(4);
      expect(evidenceUploadSection[0].type).toEqual(ClaimSummaryType.TITLE);
      expect(evidenceUploadSection[0].data?.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
      expect(evidenceUploadSection[1].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(evidenceUploadSection[2].type).toEqual(ClaimSummaryType.LINK);
      expect(evidenceUploadSection[2].data?.href).toEqual(sdoUrl);
      expect(evidenceUploadSection[3].type).toEqual(ClaimSummaryType.BUTTON);
      expect(evidenceUploadSection[3].data?.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
    });
  });
});
