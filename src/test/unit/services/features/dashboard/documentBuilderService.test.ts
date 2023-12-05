import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {buildDownloadSectionTitle, generateDocumentSection} from 'services/features/dashboard/documentBuilderService';
import {t} from 'i18next';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {displayDocumentSizeInKB} from 'common/utils/documentSizeDisplayFormatter';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {mockClaim} from '../../../../utils/mockClaim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {
  getFinalOrderDocumentCollectionMock,
} from '../../../../utils/caseProgression/mockCCDFinalOrderDocumentCollection';
import { CaseDocument } from 'common/models/document/caseDocument';

describe('documentBuilderService.ts', () => {
  it('build download section title', () => {
    //Given
    const titleExpected = ({
      type: ClaimSummaryType.TITLE,
      data: {
        text: 'text',
      },
    });

    //When
    const titleBuilt = [buildDownloadSectionTitle(titleExpected.data.text)];

    //Then
    expect(titleBuilt).toEqual([titleExpected]);
  });

  it('should generate document section', () => {
    //Given
    mockClaim.caseProgression = new CaseProgression();
    mockClaim.caseProgression.finalOrderDocumentCollection = [getFinalOrderDocumentCollectionMock()];
    const claimId = '123';
    const lang = 'eng';
    const createdLabel = t('PAGES.CLAIM_SUMMARY.DOCUMENT_CREATED', {lng: lang});
    const document = mockClaim.caseProgression.finalOrderDocumentCollection[0].value;
    const documentId = documentIdExtractor(document.documentLink?.document_binary_url);

    const generatedDocumentSectionExpected = ({
      type: ClaimSummaryType.LINK,
      data: {
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', documentId),
        text: `${document.documentName} (PDF, ${displayDocumentSizeInKB(document.documentSize)})`,
        subtitle: `${createdLabel} ${formatDateToFullDate(document.createdDatetime, lang)}`,
      },
    });

    //When
    const generatedDocumentSection = generateDocumentSection(document, claimId, lang);

    //Then
    expect(generatedDocumentSection).toEqual(generatedDocumentSectionExpected);
  });

  it('should generate document section if link is not available', () => {
    //Given
    mockClaim.caseProgression = new CaseProgression();
    mockClaim.caseProgression.finalOrderDocumentCollection = [getFinalOrderDocumentCollectionMock()];
    const claimId = '123';
    const lang = 'eng';
    const createdLabel = t('PAGES.CLAIM_SUMMARY.DOCUMENT_CREATED', {lng: lang});
    const document = mockClaim.caseProgression.finalOrderDocumentCollection[0].value;
    mockClaim.caseProgression.finalOrderDocumentCollection[0].value.documentLink = undefined;
    const documentId: string = undefined;

    const generatedDocumentSectionExpected = ({
      type: ClaimSummaryType.LINK,
      data: {
        href: CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', documentId),
        text: `${document.documentName} (PDF, ${displayDocumentSizeInKB(document.documentSize)})`,
        subtitle: `${createdLabel} ${formatDateToFullDate(document.createdDatetime, lang)}`,
      },
    });

    //When
    const generatedDocumentSection = generateDocumentSection(document, claimId, lang);

    //Then
    expect(generatedDocumentSection).toEqual(generatedDocumentSectionExpected);
  });

  it('generate document section should return nothing if no document', () => {
    //Given
    const claimId = '123';
    const lang = 'eng';
    const document: CaseDocument = undefined;
    const generatedDocumentSectionExpected: ClaimSummarySection = undefined;

    //When
    const generatedDocumentSection = generateDocumentSection(document, claimId, lang);

    //Then
    expect(generatedDocumentSection).toEqual(generatedDocumentSectionExpected);
  });
});
