import {isCaseProgressionV1Enable} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {
  getDocumentsContent,
  getEvidenceUploadContent,
  hasTrialArrangementsDocuments,
} from 'services/features/dashboard/claimSummaryService';
import {
  buildDownloadHearingNoticeSection,
  buildSystemGeneratedDocumentSections,
  buildTrialReadyDocumentSection,
} from 'services/features/dashboard/claimDocuments/claimDocumentContentBuilder';

import {Claim} from 'models/claim';
import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';
import {TableCell} from 'models/summaryList/summaryList';
import {CCDClaim} from 'models/civilClaimResponse';
import {createCCDClaimForEvidenceUpload} from '../../../../utils/caseProgression/mockCCDClaimForEvidenceUpload';
import {toCUICaseProgression} from 'services/translation/convertToCUI/convertToCUICaseProgression';
import {
  DocumentType,
  EvidenceUploadDisclosure,
  EvidenceUploadExpert, EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {UploadedEvidenceFormatter} from 'services/features/caseProgression/uploadedEvidenceFormatter';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {FIXED_DATE} from '../../../../utils/dateUtils';
import {buildDownloadSectionTitle} from 'services/features/dashboard/documentBuilderService';
import {
  buildDownloadFinalOrderSection,
} from 'services/features/dashboard/finalOrderDocuments/finalOrderDocumentContentBuilder';

jest.mock('services/features/caseProgression/uploadedEvidenceFormatter');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next');

const lang = 'en';
const urlElement = '<a> url </a>';

const isCaseProgressionV1EnableMock = isCaseProgressionV1Enable as jest.Mock;
const getDocumentTypeNameMock = UploadedEvidenceFormatter.getDocumentTypeName as jest.Mock;
const getDocumentLinkMock = UploadedEvidenceFormatter.getDocumentLink as jest.Mock;
const getTranslateMock = t as jest.Mock;

getDocumentTypeNameMock.mockImplementation((documentType:  EvidenceUploadDisclosure | EvidenceUploadWitness | EvidenceUploadExpert | EvidenceUploadTrial ) => {
  return documentType.toString();
});

getDocumentLinkMock.mockImplementation(() => {
  return urlElement;
});

getTranslateMock.mockImplementation((key: string[]) => {
  return key.toString();
});

function getTable(isClaimant: boolean, sectionText: string, documentText: string[] ): ClaimSummarySection {

  const tableRows = [] as TableCell[][];

  const isClaimantString = isClaimant == true ? 'PAGES.CLAIM_SUMMARY.CLAIMANT': 'PAGES.CLAIM_SUMMARY.DEFENDANT';

  for(let i = documentText.length-1; i >= 0; i--){
    tableRows.push([
      {html: getDocumentSectionName(isClaimantString, documentText[i]) + '<br>' + 'PAGES.CLAIM_SUMMARY.DATE_DOCUMENT_UPLOADED' + '01 Jan 1970', classes: 'govuk-!-width-one-half'},
      {html: urlElement, classes: 'govuk-!-width-one-half govuk-table__cell--numeric'},
    ]);
  }

  return {
    type: ClaimSummaryType.TABLE,
    data: {
      classes: 'tableWrap',
      head: [
        {
          html: isClaimantString + sectionText,
          classes: 'govuk-!-width-one-half',
        },
        {
          html: '',
          classes: 'govuk-!-width-one-half',
        },
      ],
      tableRows: tableRows,
    },
  };
}

function getDocumentSectionName(isClaimantString: string, documentTypeText: string): string{
  if (documentTypeText == 'STATEMENT') {
    return documentTypeText;
  } else {
    return isClaimantString + t(documentTypeText);
  }
}
const claimContainingFinalOrder = new Claim();
claimContainingFinalOrder.caseProgression = new CaseProgression();
claimContainingFinalOrder.caseProgression.finalOrderDocumentCollection = [{
  id: '1234',
  value: {
    createdBy: 'some one',
    documentLink: {
      document_url: 'url',
      document_filename: 'filename',
      document_binary_url: 'http://dm-store:8080/documents/77121e9b-e83a-440a-9429-e7f0fe89e518/binary',
    },
    documentName: 'some name',
    documentType: DocumentType.JUDGE_FINAL_ORDER,
    documentSize: 123,
    createdDatetime: FIXED_DATE,
  },
}];

describe('getDocumentsContent', () => {
  it('should return an array with one ClaimSummaryContent object with one content section containing the download claim section', async () => {
    // Given
    const claimId = '123';
    const lang = 'en';
    isCaseProgressionV1EnableMock.mockResolvedValue(true);

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
    const result = await getDocumentsContent(claim, claimId, lang);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].contentSections).toHaveLength(4);

    const downloadClaimTitle = buildDownloadSectionTitle(t('PAGES.CLAIM_SUMMARY.CLAIM_DOCUMENTS', { lng: lang }));
    const downloadClaimSection = buildSystemGeneratedDocumentSections(claim, claimId, lang);
    const downloadHearingNoticeSection = buildDownloadHearingNoticeSection(claim, claimId, lang);
    const downloadTrialReadyDocumentSection = hasTrialArrangementsDocuments(claim) ? buildTrialReadyDocumentSection(claim, claimId, lang, false) : undefined;

    expect(result[0].contentSections[0]).toEqual(downloadClaimTitle);
    expect(result[0].contentSections[1]).toEqual(downloadClaimSection[0]);
    expect(result[0].contentSections[2]).toEqual(downloadHearingNoticeSection);
    expect(result[0].contentSections[3]).toEqual(downloadTrialReadyDocumentSection);
  });

  it('should return an array with one ClaimSummaryContent object with one content section containing the Final Orders section', async () => {
    // Given
    const claimId = '123';
    const lang = 'en';
    isCaseProgressionV1EnableMock.mockResolvedValue(true);

    // When
    const result = await getDocumentsContent(claimContainingFinalOrder, claimId, lang);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].contentSections).toHaveLength(5);

    const downloadFinalOrderSectionTitle = buildDownloadFinalOrderSection(claimContainingFinalOrder, claimId, lang)[0];
    const downloadFinalOrderSectionLink = buildDownloadFinalOrderSection(claimContainingFinalOrder, claimId, lang)[1];

    expect(result[0].contentSections[0]).toEqual(downloadFinalOrderSectionTitle);
    expect(result[0].contentSections[1]).toEqual(downloadFinalOrderSectionLink);
  });

  it('should not return an array with the Final Orders section if CaseProgressionV1 disabled', async () => {
  // Given
    const claimId = '123';
    const lang = 'en';
    isCaseProgressionV1EnableMock.mockResolvedValue(false);

    // When
    const result = await getDocumentsContent(claimContainingFinalOrder, claimId, lang);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].contentSections).toHaveLength(3);

    const downloadClaimTitle = buildDownloadSectionTitle(t('PAGES.CLAIM_SUMMARY.CLAIM_DOCUMENTS', { lng: lang }));
    const downloadClaimSection = buildSystemGeneratedDocumentSections(claimContainingFinalOrder, claimId, lang);

    expect(result[0].contentSections[0]).toEqual(downloadClaimTitle);
    expect(result[0].contentSections[1]).toEqual(downloadClaimSection[0]);
  });
});

describe('getEvidenceUploadContent', () => {
  const evidenceUploadText = {'data': {'text': 'PAGES.CLAIM_SUMMARY.EVIDENCE_UPLOAD_SUMMARY'}, 'type': 'p'};
  it('should return an array with one ClaimSummaryContent object that is empty if no documents uploaded', async () => {
    // Given

    // When
    const result = getEvidenceUploadContent(new Claim(), lang);

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
    const result = getEvidenceUploadContent(claim, lang);

    // Then
    expect(result).toHaveLength(1);
    expect(result[0].contentSections).toHaveLength(9);
    expect(result[0].contentSections[0]).toEqual(evidenceUploadText);
    expect(result[0].contentSections[1]).toEqual(getTable(true, 'PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS', ['documents_for_disclosure', 'disclosure_list']));
    expect(result[0].contentSections[2]).toEqual(getTable(false, 'PAGES.CLAIM_SUMMARY.DISCLOSURE_DOCUMENTS', ['documents_for_disclosure', 'disclosure_list']));
    expect(result[0].contentSections[3]).toEqual(getTable(true, 'PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE',['documents_referred', 'notice_of_intention', 'witness_summary', 'witness_statement']));
    expect(result[0].contentSections[4]).toEqual(getTable(false, 'PAGES.CLAIM_SUMMARY.WITNESS_EVIDENCE',['documents_referred', 'notice_of_intention', 'witness_summary', 'witness_statement']));
    expect(result[0].contentSections[5]).toEqual(getTable(true, 'PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE',['answers_for_experts', 'questions_for_experts','STATEMENT', 'expert_report']));
    expect(result[0].contentSections[6]).toEqual(getTable(false, 'PAGES.CLAIM_SUMMARY.EXPERT_EVIDENCE',['answers_for_experts', 'questions_for_experts', 'STATEMENT', 'expert_report']));
    expect(result[0].contentSections[7]).toEqual(getTable(true, 'PAGES.CLAIM_SUMMARY.HEARING_DOCUMENTS',['documentary', 'costs','authorities', 'skeleton_argument', 'case_summary']));
    expect(result[0].contentSections[8]).toEqual(getTable(false, 'PAGES.CLAIM_SUMMARY.HEARING_DOCUMENTS',['documentary', 'costs','authorities', 'skeleton_argument', 'case_summary']));

  });
});
