import {checkWelshHearingNotice, getHearingContent} from 'services/features/caseProgression/hearing/hearingService';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {CASE_DOCUMENT_VIEW_URL, DASHBOARD_CLAIMANT_URL} from 'routes/urls';
import {DocumentType} from 'models/document/documentType';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {CaseProgressionHearing, CaseProgressionHearingDocuments} from 'models/caseProgression/caseProgressionHearing';
import {toInteger} from 'lodash';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {CCDRespondentResponseLanguage} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';
import {formatDocumentAlignedViewURL, formatDocumentWithHintText} from 'common/utils/formatDocumentURL';
import {alignText} from 'form/models/alignText';
import {ClaimantResponse} from 'models/claimantResponse';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {
  WelshLanguageRequirements,
} from 'models/directionsQuestionnaire/welshLanguageRequirements/welshLanguageRequirements';
import {Language} from 'models/directionsQuestionnaire/welshLanguageRequirements/language';
import {CaseRole} from 'form/models/caseRoles';

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

describe('checkWelshHearingNotice', () => {
  let claim: Claim;

  beforeEach(() => {
    claim = new Claim();
    claim.isClaimant = jest.fn(() => false);
    claim.isDefendant = jest.fn(() => false);
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.ENGLISH;
    claim.respondent1LiPResponse = undefined;
    claim.claimantResponse = undefined;
    claim.directionQuestionnaire = undefined;
  });

  it('should return false when claimant = true but not bilingual nor docsLanguage = WELSH/WELSH_AND_ENGLISH', () => {
    (claim.isClaimant as jest.Mock).mockReturnValue(true);
    const result = checkWelshHearingNotice(claim);
    expect(result).toBe(false);
  });

  it('should return true when claimant = true and isClaimantWelshBilingual = true', () => {
    (claim.isClaimant as jest.Mock).mockReturnValue(true);
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    const result = checkWelshHearingNotice(claim);
    expect(result).toBe(true);
  });

  it('should return true when claimant = true and docsLanguageClaimant = WELSH', () => {
    (claim.isClaimant as jest.Mock).mockReturnValue(true);
    claim.claimantResponse = {
      directionQuestionnaire: {
        welshLanguageRequirements: {
          language: { documentsLanguage: LanguageOptions.WELSH },
        },
      },
    } as any;
    const result = checkWelshHearingNotice(claim);
    expect(result).toBe(true);
  });

  it('should return true when claimant = true and docsLanguageClaimant = WELSH_AND_ENGLISH', () => {
    (claim.isClaimant as jest.Mock).mockReturnValue(true);
    claim.claimantResponse = {
      directionQuestionnaire: {
        welshLanguageRequirements: {
          language: { documentsLanguage: LanguageOptions.WELSH_AND_ENGLISH },
        },
      },
    } as any;
    const result = checkWelshHearingNotice(claim);
    expect(result).toBe(true);
  });

  it('should return false when defendant = true but not BOTH nor docsLanguage = WELSH/WELSH_AND_ENGLISH', () => {
    (claim.isDefendant as jest.Mock).mockReturnValue(true);
    const result = checkWelshHearingNotice(claim);
    expect(result).toBe(false);
  });

  it('should return true when defendant = true and respondent1LiPResponse = BOTH', () => {
    (claim.isDefendant as jest.Mock).mockReturnValue(true);
    claim.respondent1LiPResponse = { respondent1ResponseLanguage: CCDRespondentResponseLanguage.BOTH };
    const result = checkWelshHearingNotice(claim);
    expect(result).toBe(true);
  });

  it('should return true when defendant = true and docsLanguageDefendant = WELSH', () => {
    (claim.isDefendant as jest.Mock).mockReturnValue(true);
    claim.directionQuestionnaire = {
      welshLanguageRequirements: {
        language: { documentsLanguage: LanguageOptions.WELSH },
      },
    } as any;
    const result = checkWelshHearingNotice(claim);
    expect(result).toBe(true);
  });

  it('should return true when defendant = true and docsLanguageDefendant = WELSH_AND_ENGLISH', () => {
    (claim.isDefendant as jest.Mock).mockReturnValue(true);
    claim.directionQuestionnaire = {
      welshLanguageRequirements: {
        language: { documentsLanguage: LanguageOptions.WELSH_AND_ENGLISH },
      },
    } as any;
    const result = checkWelshHearingNotice(claim);
    expect(result).toBe(true);
  });

  it('should return false if neither claimant nor defendant and no docsLanguage', () => {
    const result = checkWelshHearingNotice(claim);
    expect(result).toBe(false);
  });
});

jest.mock('common/utils/formatDocumentURL');
jest.mock('services/features/caseProgression/hearing/hearingService', () => {
  const originalModule = jest.requireActual('services/features/caseProgression/hearing/hearingService');
  return {
    ...originalModule,
    checkWelshHearingNotice: jest.fn(),
  };
});

describe('getHearingsSummary - hearingDocumentsWelsh block', () => {
  const lang = 'en';
  const claimId = '1234';
  const fileName = 'TestDoc.pdf';
  const binaryId = 'uuid-binary-id';
  const binaryUrl = `http://dm-store:8080/documents/${binaryId}/binary`;
  const docViewUrl = CASE_DOCUMENT_VIEW_URL
    .replace(':id', claimId)
    .replace(':documentId', documentIdExtractor(binaryUrl));
  const dashboardUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);

  let claim: Claim;
  let hearingDocWelsh: CaseProgressionHearingDocuments;

  beforeEach(() => {
    claim = new Claim();
    claim.id = claimId;
    claim.caseProgression = new CaseProgression();
    claim.caseProgressionHearing = new CaseProgressionHearing();
    claim.caseProgressionHearing.hearingDocuments = [];
    claim.caseProgressionHearing.hearingDocumentsWelsh = [];


    hearingDocWelsh = {
      id: 'docWelshId',
      value: {
        createdBy: 'userTest',
        documentLink: {
          document_filename: fileName,
          document_url: docViewUrl,
          document_binary_url: binaryUrl,
        },
        documentName: fileName,
        documentType: DocumentType.HEARING_FORM,
        documentSize: toInteger(200),
        createdDatetime: new Date(),
      },
    };

    (formatDocumentAlignedViewURL as jest.Mock).mockImplementation(
      (name: string, id: string, binUrl: string, align: alignText) =>
        `<a href="${binUrl}" class="${align}">${name}</a>`
    );

    (formatDocumentWithHintText as jest.Mock).mockImplementation(
      (label: string, date: Date) => `${label} - ${date?.toISOString()}`
    );
  });

  it('should do nothing if hearingDocumentsWelsh is empty', () => {
    const content = getHearingContent(claim.id, claim, lang, dashboardUrl);
    const summarySection = content[0].contentSections[1];
    const rows = (summarySection.data as any).rows;
    expect(rows).toHaveLength(0);
  });

  it('should do nothing if checkWelshHearingNotice returns false', () => {
    (checkWelshHearingNotice as jest.Mock).mockReturnValue(false);
    claim.caseProgressionHearing.hearingDocumentsWelsh = [hearingDocWelsh];
    const content = getHearingContent(claim.id, claim, lang, dashboardUrl);
    const rows = (content[0].contentSections[1].data as any).rows;
    expect(rows).toHaveLength(0);
  });

  it('should do nothing if checkWelshHearingNotice is true but hearingDocumentWelsh has no value', () => {
    (checkWelshHearingNotice as jest.Mock).mockReturnValue(true);
    claim.caseProgressionHearing.hearingDocumentsWelsh = [{id:'docWelshNoValue', value: undefined}];
    const content = getHearingContent(claim.id, claim, lang, dashboardUrl);
    const rows = (content[0].contentSections[1].data as any).rows;
    expect(rows).toHaveLength(0);
  });

  it('should add a row if checkWelshHearingNotice is true and hearingDocumentWelsh has a valid value', () => {
    (checkWelshHearingNotice as jest.Mock).mockReturnValue(true);
    claim.caseProgressionHearing.hearingDocumentsWelsh = [hearingDocWelsh];
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.directionQuestionnaire = new DirectionQuestionnaire();
    claim.claimantResponse.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
    claim.claimantResponse.directionQuestionnaire.welshLanguageRequirements.language = new Language();
    claim.claimantResponse.directionQuestionnaire.welshLanguageRequirements.language.documentsLanguage = LanguageOptions.WELSH;
    claim.caseRole = CaseRole.CLAIMANT;
    const content = getHearingContent(claim.id, claim, lang, dashboardUrl);
    const summarySection = content[0].contentSections[1];
    const rows = (summarySection.data as any).rows;
    expect(rows).toHaveLength(1);
    expect(rows[0].value.html).toContain(fileName);
  });

  it('should add multiple rows if there are multiple hearingDocumentsWelsh, checkWelshHearingNotice is true, and each has a value', () => {
    (checkWelshHearingNotice as jest.Mock).mockReturnValue(true);
    claim.caseProgressionHearing.hearingDocumentsWelsh = [hearingDocWelsh, hearingDocWelsh];
    claim.directionQuestionnaire = new DirectionQuestionnaire();
    claim.directionQuestionnaire.welshLanguageRequirements = new WelshLanguageRequirements();
    claim.directionQuestionnaire.welshLanguageRequirements.language = new Language();
    claim.directionQuestionnaire.welshLanguageRequirements.language.documentsLanguage = LanguageOptions.WELSH;
    claim.caseRole = CaseRole.DEFENDANT;
    const content = getHearingContent(claim.id, claim, lang, dashboardUrl);
    const rows = (content[0].contentSections[1].data as any).rows;
    expect(rows).toHaveLength(2);
  });
});
