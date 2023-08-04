import {getDocumentsContent, getEvidenceUploadContent} from 'services/features/dashboard/claimSummaryService';
import {
  buildSystemGeneratedDocumentSections,
  buildDownloadSealedClaimSectionTitle,
} from 'services/features/dashboard/claimDocuments/claimDocumentContentBuilder';

import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';
import {TableCell} from 'models/summaryList/summaryList';
import {CCDClaim} from 'models/civilClaimResponse';
import {createCCDClaimForEvidenceUpload} from '../../../../utils/caseProgression/mockCCDClaimForEvidenceUpload';
import {toCUICaseProgression} from 'services/translation/convertToCUI/convertToCUIEvidenceUpload';
import {DocumentType} from 'models/document/documentType';
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
      {html: getDocumentSectionName(isClaimantString, documentText[i]) + '<br>' + 'PAGES.CLAIM_SUMMARY.DATE_DOCUMENT_UPLOADED' + '01 Jan 1970', classes: 'govuk-!-width-one-half'},
      {html: '<a class="govuk-link" href="href will need to be connected to document">'+getDocumentName(sectionText, documentText[i])+'</a>', classes: 'govuk-!-width-one-half govuk-table__cell--numeric'},
    ]);
  }

  return {
    type: ClaimSummaryType.TABLE,
    data: {
      head: [
        {
          text: isClaimantString + sectionText,
          classes: 'govuk-!-width-one-half',
        },
        {
          text: '',
          classes: 'govuk-!-width-one-half',
        },
      ],
      tableRows: tableRows,
    },
  };
}

function getDocumentName(sectionText: string, documentTypeText: string): string
{
  let documentText: string;

  if (sectionText.includes('DISCLOSURE') || sectionText.includes('HEARING') || documentTypeText == 'pages.claim_summary.documents_referred_to_statement') {
    documentText = 'document_type.pdf';
  } else if (sectionText.includes('WITNESS')){
    documentText = 'witness_document.pdf';
  } else {
    documentText = 'expert_document.pdf';
  }
  return documentText;
}

function getDocumentSectionName(isClaimantString: string, documentTypeText: string): string
{
  if (documentTypeText == 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.JOINT_STATEMENT_OF_EXPERTS') {
    return documentTypeText;
  } else {
    return isClaimantString + t(documentTypeText);
  }
}

describe('getDocumentsContent', () => {
  it('should return an array with one ClaimSummaryContent object with one content section containing the download claim section', async () => {
    // Given
    const claimId = '123';
    const lang = 'en';
    const claim = new Claim();
    claim.systemGeneratedCaseDocuments =  [{
      id: '1234',
      value: {
        createdBy: 'some one',
        documentLink: {
          document_url: 'url',
          document_filename: 'filename',
          document_binary_url: 'http://dm-store:8080/documents/77121e9b-e83a-440a-9429-e7f0fe89e518/binary',
        },
        documentName: 'some name',
        documentType: DocumentType.DEFENDANT_DEFENCE,
        documentSize: 123,
        createdDatetime: new Date(),
      },
    }];

    // When
    const result = getDocumentsContent(claim, claimId, lang);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].contentSections).toHaveLength(2);

    const downloadClaimTitle = buildDownloadSealedClaimSectionTitle(lang);
    const downloadClaimSection = buildSystemGeneratedDocumentSections(new claim(), claimId, lang);

    expect(result[0].contentSections[0]).toEqual(downloadClaimTitle);
    expect(result[0].contentSections[1]).toEqual(downloadClaimSection[0]);
  });
});

describe('getEvidenceUploadContent', () => {
  const evidenceUploadText = {'data': {'text': 'PAGES.CLAIM_SUMMARY.EVIDENCE_UPLOAD_SUMMARY'}, 'type': 'p'};
  it('should return an array with one ClaimSummaryContent object that is empty if no documents uploaded', async () => {
    // Given

    // When
    const result = getEvidenceUploadContent(new Claim());

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].contentSections[0]).toEqual(evidenceUploadText);

  });

  it('should return an array with one ClaimSummaryContent object that has two sections with two table rows', async () => {
    // Given
    const ccdClaim: CCDClaim = createCCDClaimForEvidenceUpload();
    const claim: Claim = new Claim();
    claim.caseProgression = toCUICaseProgression(ccdClaim);

    // When
    const result = getEvidenceUploadContent(claim);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].contentSections).toHaveLength(9);
    expect(result[0].contentSections[0]).toEqual(evidenceUploadText);
    expect(result[0].contentSections[1]).toEqual(getTable(true, 'PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS', ['pages.upload_evidence_documents.documents_for_disclosure', 'pages.upload_evidence_documents.disclosure_list']));
    expect(result[0].contentSections[2]).toEqual(getTable(false, 'PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS', ['pages.upload_evidence_documents.documents_for_disclosure', 'pages.upload_evidence_documents.disclosure_list']));
    expect(result[0].contentSections[3]).toEqual(getTable(true, 'PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE',['pages.claim_summary.documents_referred_to_statement', 'pages.claim_summary.notice_of_intention','pages.upload_evidence_documents.witness_summary','pages.upload_evidence_documents.witness_statement']));
    expect(result[0].contentSections[4]).toEqual(getTable(false, 'PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE',['pages.claim_summary.documents_referred_to_statement', 'pages.claim_summary.notice_of_intention','pages.upload_evidence_documents.witness_summary','pages.upload_evidence_documents.witness_statement']));
    expect(result[0].contentSections[5]).toEqual(getTable(true, 'PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE',['pages.upload_evidence_documents.answers_to_questions',  'pages.upload_evidence_documents.questions_for_other_party','PAGES.UPLOAD_EVIDENCE_DOCUMENTS.JOINT_STATEMENT_OF_EXPERTS', 'pages.claim_summary.expert_report']));
    expect(result[0].contentSections[6]).toEqual(getTable(false, 'PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE',['pages.upload_evidence_documents.answers_to_questions', 'pages.upload_evidence_documents.questions_for_other_party', 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.JOINT_STATEMENT_OF_EXPERTS', 'pages.claim_summary.expert_report']));
    expect(result[0].contentSections[7]).toEqual(getTable(true, 'PAGES.CLAIM_SUMMARY.HEARING_DOCUMENTS',['pages.claim_summary.documentary_evidence', 'pages.upload_evidence_documents.costs','pages.upload_evidence_documents.legal_authorities', 'pages.upload_evidence_documents.skeleton_argument', 'pages.upload_evidence_documents.case_summary']));
    expect(result[0].contentSections[8]).toEqual(getTable(false, 'PAGES.CLAIM_SUMMARY.HEARING_DOCUMENTS',['pages.claim_summary.documentary_evidence', 'pages.upload_evidence_documents.costs','pages.upload_evidence_documents.legal_authorities', 'pages.upload_evidence_documents.skeleton_argument', 'pages.upload_evidence_documents.case_summary']));
  });
});
