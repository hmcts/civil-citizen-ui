import {mockClaim} from '../../../../../utils/mockClaim';
import {
  getCaseProgressionHearingMock,
  getCaseProgressionTrialArrangementsMock,
} from '../../../../../utils/caseProgression/mockCaseProgressionHearing';
import {
  buildDownloadHearingNoticeSection,
  buildSystemGeneratedDocumentSections,
  buildDownloadSealedResponseSection, buildTrialReadyDocumentSection,
} from 'services/features/dashboard/claimDocuments/claimDocumentContentBuilder';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';
import {DocumentUri} from 'common/models/document/documentType';
import {documentIdExtractor} from 'common/utils/stringUtils';

describe('Claim document content builder', ()=>{
  it('should return json with document size in KB and link to download the pdf', ()=>{
    //When
    const claimDocumentSection = buildSystemGeneratedDocumentSections(mockClaim, '1', 'en');

    //Then
    expect(claimDocumentSection).not.toBeUndefined();
    expect(claimDocumentSection[0].data?.href).toBe(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '1').replace(':documentId', '71582e35-300e-4294-a604-35d8cabc33de'));
    expect(claimDocumentSection[0].data?.text).toContain('45 KB');
    expect(claimDocumentSection[0].data?.subtitle).toContain('21 June 2022');
  });

  it('should return json with document size in KB and link to defendant response pdf', ()=>{
    //When
    const claimDocumentSection = buildDownloadSealedResponseSection(mockClaim, '2', 'en');
    //Then
    expect(claimDocumentSection).not.toBeUndefined();
    expect(claimDocumentSection.data?.href).toBe(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '2').replace(':documentId', '7f092465-658e-4ec1-af30-b5551b5260b4').replace(':documentType', DocumentUri.DEFENDANT_DEFENCE));
    expect(claimDocumentSection.data?.text).toContain('33 KB');
    expect(claimDocumentSection.data?.subtitle).toContain('22 June 2022');
  });
});

describe('Hearing Notice document content builder', ()=>{
  it('should return nothing if correct information missing', ()=>{
    //When
    const hearingNoticeSection = buildDownloadHearingNoticeSection(mockClaim, '1', 'eng');
    //Then
    expect(hearingNoticeSection).toBeUndefined();
  });

  it('should return json with document size in KB and link to download the pdf', ()=>{
    //given
    mockClaim.caseProgressionHearing = getCaseProgressionHearingMock();
    //When
    const hearingNoticeSection = buildDownloadHearingNoticeSection(mockClaim, '1', 'eng');
    //Then
    expect(hearingNoticeSection).not.toBeUndefined();
    expect(hearingNoticeSection.data?.href).toBe(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '1').replace(':documentId', getSystemGeneratedCaseDocumentIdByType(mockClaim.caseProgressionHearing.hearingDocuments, DocumentType.HEARING_FORM)));
    expect(hearingNoticeSection.data?.text).toContain('55 KB');
    expect(hearingNoticeSection.data?.subtitle).toContain('21 June 2022');
  });
});

describe('Trial Arrangements document content', () => {
  it('should return nothing if correct information missing for claimant', () => {
    //Given
    const claim = mockClaim;
    const isClaimant = true;
    //When
    const trialArrangementsSection = buildTrialReadyDocumentSection(claim, '1234', 'eng', isClaimant);
    //Then
    expect(trialArrangementsSection).toBeUndefined();
  });

  it('should return nothing if correct information missing for defendant', () => {
    //Given
    const claim = mockClaim;
    const isClaimant = false;
    //When
    const trialArrangementsSection = buildTrialReadyDocumentSection(claim, '1234', 'eng', isClaimant);
    //Then
    expect(trialArrangementsSection).toBeUndefined();
  });

  it('should return json with document size in KB and link to download the pdf for claimant', () => {
    //Given
    const isClaimant = true;
    const claim = mockClaim;
    mockClaim.caseProgression = getCaseProgressionTrialArrangementsMock(isClaimant);
    //When
    const trialArrangementsSection = buildTrialReadyDocumentSection(claim, '1234', 'eng', isClaimant);
    //Then
    expect(trialArrangementsSection).toBeDefined();
    expect(trialArrangementsSection.data.href).toBe(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '1234').replace(':documentId', documentIdExtractor(claim.caseProgression.claimantTrialArrangements.trialArrangementsDocument.value.documentLink.document_binary_url)));
    expect(trialArrangementsSection.data.text).toContain('55 KB');
    expect(trialArrangementsSection.data.subtitle).toContain('21 June 2022');
  });

  it('should return json with document size in KB and link to download the pdf for defendant', () => {
    //Given
    const isClaimant = false;
    const claim = mockClaim;
    mockClaim.caseProgression = getCaseProgressionTrialArrangementsMock(isClaimant);
    //When
    const trialArrangementsSection = buildTrialReadyDocumentSection(claim, '1234', 'eng', isClaimant);
    //Then
    expect(trialArrangementsSection).toBeDefined();
    expect(trialArrangementsSection.data.href).toBe(CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '1234').replace(':documentId', documentIdExtractor(claim.caseProgression.defendantTrialArrangements.trialArrangementsDocument.value.documentLink.document_binary_url)));
    expect(trialArrangementsSection.data.text).toContain('55 KB');
    expect(trialArrangementsSection.data.subtitle).toContain('21 June 2022');
  });
});
