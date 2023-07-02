import {getDocumentsContent, getEvidenceUploadContent} from 'services/features/dashboard/claimSummaryService';
import {buildDownloadSealedClaimSection} from 'services/features/dashboard/claimDocuments/claimDocumentContentBuilder';

import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';
import {TableCell} from 'models/summaryList/summaryList';
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

function getTable(isClaimant: boolean, sectionText: string, documentText: string[] ): ClaimSummarySection {

  const tableRows = [] as TableCell[][];

  const isClaimantString = isClaimant == true ? 'PAGES.CLAIM_SUMMARY.CLAIMANT': 'PAGES.CLAIM_SUMMARY.DEFENDANT';

  for(let i = documentText.length-1; i >= 0; i--){
    tableRows.push([
      {html: isClaimantString + t(documentText[i]) + '<br>' + 'PAGES.CLAIM_SUMMARY.DATE_DOCUMENT_UPLOADED' + '20-02-2022'},
      {html: '<a href="href will need to be connected to document">'+'testfile.txt'+'</a>'},
    ]);
  }

  return {
    type: ClaimSummaryType.TABLE,
    data: {
      head: [
        {
          text: isClaimantString + sectionText,
        },
        {
          text: '',
        },
      ],
      tableRows: tableRows,
    },
  };
}

describe('getDocumentsContent', () => {
  it('should return an array with one ClaimSummaryContent object with one content section containing the download claim section', async () => {
    // Given
    const claimId = '123';
    const lang = 'en';

    // When
    const result = getDocumentsContent(new Claim(), claimId, lang);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].contentSections).toHaveLength(1);

    const downloadClaimSection = buildDownloadSealedClaimSection(new Claim(), claimId, lang);

    expect(result[0].contentSections[0]).toEqual(downloadClaimSection);
  });
});

describe('getEvidenceUploadContent', () => {
  it('should return an array with one ClaimSummaryContent object that is empty if no documents uploaded', async () => {
    // Given

    // When
    const result = getEvidenceUploadContent(new Claim());

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].contentSections).toHaveLength(0);
  });

  it('should return an array with one ClaimSummaryContent object that has two sections with two table rows', async () => {
    // Given
    const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');

    // When
    const result = getEvidenceUploadContent(claim.case_data);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].contentSections).toHaveLength(8);
    expect(result[0].contentSections[0]).toEqual(getTable(true, 'PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS', ['pages.upload_evidence_documents.disclosure_list', 'pages.upload_evidence_documents.documents_for_disclosure']));
    expect(result[0].contentSections[1]).toEqual(getTable(false, 'PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS', ['pages.upload_evidence_documents.disclosure_list', 'pages.upload_evidence_documents.documents_for_disclosure']));
    expect(result[0].contentSections[2]).toEqual(getTable(true, 'PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE',['pages.upload_evidence_documents.documents_referred_to_statement', 'pages.claim_summary.notice_of_intention','pages.upload_evidence_documents.witness_summary','pages.upload_evidence_documents.witness_statement']));
    expect(result[0].contentSections[3]).toEqual(getTable(false, 'PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE',['pages.upload_evidence_documents.documents_referred_to_statement', 'pages.claim_summary.notice_of_intention','pages.upload_evidence_documents.witness_summary','pages.upload_evidence_documents.witness_statement']));
    expect(result[0].contentSections[4]).toEqual(getTable(true, 'PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE',['pages.upload_evidence_documents.answers_to_questions', 'pages.upload_evidence_documents.questions_for_other_party', 'pages.upload_evidence_documents.experts_report']));
    expect(result[0].contentSections[5]).toEqual(getTable(false, 'PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE',['pages.upload_evidence_documents.answers_to_questions', 'pages.upload_evidence_documents.questions_for_other_party', 'pages.upload_evidence_documents.experts_report']));
    expect(result[0].contentSections[6]).toEqual(getTable(true, 'PAGES.CLAIM_SUMMARY.HEARING_DOCUMENTS',['pages.claim_summary.documentary_evidence', 'pages.upload_evidence_documents.costs','pages.upload_evidence_documents.legal_authorities', 'pages.upload_evidence_documents.skeleton_argument', 'pages.upload_evidence_documents.case_summary']));
    expect(result[0].contentSections[7]).toEqual(getTable(false, 'PAGES.CLAIM_SUMMARY.HEARING_DOCUMENTS',['pages.claim_summary.documentary_evidence', 'pages.upload_evidence_documents.costs','pages.upload_evidence_documents.legal_authorities', 'pages.upload_evidence_documents.skeleton_argument', 'pages.upload_evidence_documents.case_summary']));
  });
});
