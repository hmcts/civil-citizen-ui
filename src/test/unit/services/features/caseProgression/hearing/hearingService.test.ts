import {getHearingContent} from 'services/features/caseProgression/hearing/hearingService';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {CASE_DOCUMENT_VIEW_URL, DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {
  DocumentType,
} from 'models/document/documentType';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {CaseProgressionHearing, CaseProgressionHearingDocuments} from 'models/caseProgression/caseProgressionHearing';
import {toInteger} from 'lodash';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {CCDRespondentResponseLanguage} from 'models/ccdResponse/ccdRespondentLiPResponse';

const lang = 'en';
const createdBy= 'Jhon';
const claimId = '1234';
const fileName = 'Name of file';
const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
const binary_url = `http://dm-store:8080/documents/${binary}/binary`;
const url = CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(binary_url));
const document = {document_filename: fileName, document_url: url, document_binary_url: binary_url};

describe('getHearingContent', () =>{
  const hearingDocuments : CaseProgressionHearingDocuments = {id:'Document test', value: {
    createdBy: createdBy,
    documentLink: document,
    documentName: fileName,
    documentType: DocumentType.HEARING_FORM,
    documentSize: toInteger(5),
    createdDatetime: new Date(),
  }};

  describe('getHearingContent', () => {
    it('hearing info should be displayed', () => {
      //given
      const caseData = new Claim();
      caseData.id = '1234';
      caseData.caseProgression = new CaseProgression();
      caseData.caseProgressionHearing = new CaseProgressionHearing();
      caseData.caseProgressionHearing.hearingDocuments = [new CaseProgressionHearingDocuments()];
      caseData.caseProgressionHearing.hearingDocuments.push(hearingDocuments);
      const dashboardUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);

      //when
      const hearingActual = getHearingContent(caseData.id, caseData, lang,dashboardUrl);

      //then
      expect(hearingActual[0].contentSections[0].type).toMatch(ClaimSummaryType.TITLE);
      expect(hearingActual[0].contentSections[1].type).toMatch(ClaimSummaryType.SUMMARY);
      expect(hearingActual[1].contentSections[0].type).toMatch(ClaimSummaryType.BUTTON);

    });
  });
});

describe('getHearingContent - hearingDocumentsWelsh', () => {
  const lang = 'en';
  const claimId = '1234';
  const createdBy = 'Jhon';
  const fileName = 'Name of file';
  const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';
  const binaryUrl = `http://dm-store:8080/documents/${binary}/binary`;
  const docViewUrl = CASE_DOCUMENT_VIEW_URL
    .replace(':id', claimId)
    .replace(':documentId', documentIdExtractor(binaryUrl));
  const documentMock = {
    document_filename: fileName,
    document_url: docViewUrl,
    document_binary_url: binaryUrl,
  };
  const dashboardUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);

  const hearingDocWelsh: CaseProgressionHearingDocuments = {
    id: 'welshDocId',
    value: {
      createdBy: createdBy,
      documentLink: documentMock,
      documentName: fileName,
      documentType: DocumentType.HEARING_FORM,
      documentSize: toInteger(5),
      createdDatetime: new Date(),
    },
  };

  const hearingDocWelshNoValue: CaseProgressionHearingDocuments = {
    id: 'welshDocNoValue',
    value: undefined,
  };

  let claim: Claim;

  beforeEach(() => {
    claim = new Claim();
    claim.id = claimId;
    claim.caseProgression = new CaseProgression();
    claim.caseProgressionHearing = new CaseProgressionHearing();
    claim.caseProgressionHearing.hearingDocuments = [];
    claim.caseProgressionHearing.hearingDocumentsWelsh = [];

    claim.isClaimant = jest.fn(() => false);
    claim.isDefendant = jest.fn(() => false);
  });

  it('No items in hearingDocumentsWelsh => no new row', () => {
    // when
    const hearingContent = getHearingContent(claim.id, claim, lang, dashboardUrl);
    // then
    const summarySection = hearingContent[0].contentSections[1]; // SUMMARY
    const rows = (summarySection.data as any).rows;
    expect(rows).toHaveLength(0);
  });

  it('Claimant bilingual preference (WELSH_AND_ENGLISH), valid hearingDocumentWelsh => 1 new row', () => {
    // given
    claim.isClaimant = jest.fn(() => true);
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    claim.caseProgressionHearing.hearingDocumentsWelsh = [hearingDocWelsh];

    // when
    const hearingContent = getHearingContent(claim.id, claim, lang, dashboardUrl);

    // then
    const summarySection = hearingContent[0].contentSections[1]; // SUMMARY
    const rows = (summarySection.data as any).rows;
    expect(rows).toHaveLength(1);
    expect(rows[0].value.html).toContain(fileName);
  });

  it('Claimant bilingual preference (WELSH_AND_ENGLISH), but hearingDocumentWelsh has no value => no row added', () => {
    // given
    claim.isClaimant = jest.fn(() => true);
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    claim.caseProgressionHearing.hearingDocumentsWelsh = [hearingDocWelshNoValue];

    // when
    const hearingContent = getHearingContent(claim.id, claim, lang, dashboardUrl);

    // then
    const summarySection = hearingContent[0].contentSections[1]; // SUMMARY
    const rows = (summarySection.data as any).rows;
    expect(rows).toHaveLength(0);
  });

  it('Defendant with respondent1ResponseLanguage = "BOTH", valid hearingDocumentWelsh => 1 new row', () => {
    // given
    claim.isDefendant = jest.fn(() => true);
    claim.respondent1LiPResponse = { respondent1ResponseLanguage: CCDRespondentResponseLanguage.BOTH };
    claim.caseProgressionHearing.hearingDocumentsWelsh = [hearingDocWelsh];

    // when
    const hearingContent = getHearingContent(claim.id, claim, lang, dashboardUrl);

    // then
    const summarySection = hearingContent[0].contentSections[1]; // SUMMARY
    const rows = (summarySection.data as any).rows;
    expect(rows).toHaveLength(1);
    expect(rows[0].value.html).toContain(fileName);
  });

  it('Defendant with respondent1ResponseLanguage = "BOTH", but hearingDocWelsh has no value => no row added', () => {
    // given
    claim.isDefendant = jest.fn(() => true);
    claim.respondent1LiPResponse = { respondent1ResponseLanguage: CCDRespondentResponseLanguage.BOTH };
    claim.caseProgressionHearing.hearingDocumentsWelsh = [hearingDocWelshNoValue];

    // when
    const hearingContent = getHearingContent(claim.id, claim, lang, dashboardUrl);

    // then
    const summarySection = hearingContent[0].contentSections[1]; // SUMMARY
    const rows = (summarySection.data as any).rows;
    expect(rows).toHaveLength(0);
  });

  it('Claimant is not bilingual + Defendant is not "BOTH" => hearingDocumentsWelsh does not add rows', () => {
    // given
    claim.isClaimant = jest.fn(() => true); // true
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.ENGLISH; // no es WELSH_AND_ENGLISH
    claim.isDefendant = jest.fn(() => false);
    claim.caseProgressionHearing.hearingDocumentsWelsh = [hearingDocWelsh];

    // when
    const hearingContent = getHearingContent(claim.id, claim, lang, dashboardUrl);

    // then
    const summarySection = hearingContent[0].contentSections[1];
    const rows = (summarySection.data as any).rows;
    expect(rows).toHaveLength(0);
  });
});
