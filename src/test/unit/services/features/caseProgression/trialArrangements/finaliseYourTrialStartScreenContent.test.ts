import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {DocumentType} from 'models/document/documentType';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {getFinaliseTrialArrangementContents} from 'services/features/caseProgression/trialArrangements/finaliseYourTrialStartScreenContent';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {ClaimSummaryType} from 'form/models/claimSummarySection';

const claimId = '1234567890123456';

const systemGeneratedDocument = (documentType: DocumentType, documentName: string, documentId: string) => ({
  id: '1',
  value: {
    createdBy: 'Civil',
    documentLink: {
      document_url: `http://dm-store:8080/documents/${documentId}`,
      document_filename: documentName,
      document_binary_url: `http://dm-store:8080/documents/${documentId}/binary`,
    },
    documentName,
    documentSize: 100,
    documentType,
    createdDatetime: new Date('2022-06-21'),
  },
});

const buildClaim = (caseRole: CaseRole = CaseRole.DEFENDANT): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.caseRole = caseRole;
  claim.totalClaimAmount = 1000;
  claim.caseProgressionHearing = {
    hearingDate: new Date('2024-12-01'),
  } as CaseProgressionHearing;
  return claim;
};

describe('getFinaliseTrialArrangementContents', () => {
  it('should show unavailable text when directions documents are missing', () => {
    const claim = buildClaim();

    const content = getFinaliseTrialArrangementContents(claimId, claim, 'en');

    const unavailableSections = content.filter(
      (section) => section.data?.text === 'COMMON.DOCUMENT_NOT_AVAILABLE_YET',
    );
    expect(unavailableSections).toHaveLength(2);
    expect(unavailableSections.every((section) => section.type === ClaimSummaryType.PARAGRAPH)).toBe(true);
  });

  it('should build document links for a defendant when documents are available', () => {
    const claim = buildClaim(CaseRole.DEFENDANT);
    claim.systemGeneratedCaseDocuments = [
      systemGeneratedDocument(DocumentType.SDO_ORDER, 'sdo.pdf', 'sdo-doc'),
      systemGeneratedDocument(DocumentType.DIRECTIONS_QUESTIONNAIRE, 'defendant_dq.pdf', 'dq-doc'),
    ];

    const content = getFinaliseTrialArrangementContents(claimId, claim, 'en');

    expect(content.some((section) =>
      section.data?.href === CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', 'sdo-doc'),
    )).toBe(true);
    expect(content.some((section) =>
      section.data?.href === CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', 'dq-doc'),
    )).toBe(true);
  });

  it('should build document links for a claimant when documents are available', () => {
    const claim = buildClaim(CaseRole.CLAIMANT);
    claim.systemGeneratedCaseDocuments = [
      systemGeneratedDocument(DocumentType.SDO_ORDER, 'sdo.pdf', 'sdo-doc'),
      systemGeneratedDocument(DocumentType.DIRECTIONS_QUESTIONNAIRE, 'claimant_dq.pdf', 'claimant-dq'),
    ];

    const content = getFinaliseTrialArrangementContents(claimId, claim, 'en');

    expect(content.some((section) =>
      section.data?.href === CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', 'claimant-dq'),
    )).toBe(true);
  });
});
