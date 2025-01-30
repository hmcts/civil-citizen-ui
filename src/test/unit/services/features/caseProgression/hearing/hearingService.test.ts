import {checkWelshHearingNotice, getHearingContent} from 'services/features/caseProgression/hearing/hearingService';
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
import {LanguageOptions} from 'models/directionsQuestionnaire/languageOptions';

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
