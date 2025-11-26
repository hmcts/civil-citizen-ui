import {Claim} from 'models/claim';
import {
  getClaimantDocuments,
  getCourtDocuments,
  getDefendantDocuments,
} from 'services/features/dashboard/ordersAndNoticesService';
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import {YesNoUpperCamelCase, YesNoUpperCase} from 'form/models/yesNo';
import {DocumentType} from 'models/document/documentType';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {CaseRole} from 'form/models/caseRoles';
import {Document} from 'models/document/document';
import {ClaimantResponse} from 'models/claimantResponse';
import {
  isCaseWorkerEventsEnabled,
  isGaForLipsEnabled, isJudgmentOnlineLive,
} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {CaseDocument} from 'models/document/caseDocument';
import {TrialArrangements} from 'models/caseProgression/trialArrangements/trialArrangements';
import * as launchDarklyClient from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {FinalOrderDocumentCollection} from 'models/caseProgression/finalOrderDocumentCollectionType';
import {FIXED_DATE} from '../../../../utils/dateUtils';

jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
const isWelshEnabledForMainCase = launchDarklyClient.isWelshEnabledForMainCase as jest.Mock;

describe('View Orders And Notices Service', () => {

  describe('Get Claimant Documents', () => {
    const claimId = 'test1';
    const documentUrl = '/case/test1/view-documents/71582e35-300e-4294-a604-35d8cabc33de';
    it('should get empty array if there is no data', async () => {
      //given
      const claim = new Claim();
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedResult = new DocumentsViewComponent('Claimant', []);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant dq', async () => {
      //given
      const documentName = 'claimant_test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DIRECTIONS_QUESTIONNAIRE);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.CLAIMANT_DQ',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant bilingual dq', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.CLAIMANT_INTENTION_TRANSLATED_DOCUMENT);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.CLAIMANT_DQ',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant bilingual dq when cuiWelshFlag is on', async () => {
      //given
      isWelshEnabledForMainCase.mockResolvedValue(true);
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.CLAIMANT_INTENTION_TRANSLATED_DOCUMENT);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.TRANSLATED_CLAIMANT_DQ',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant english dq when cuiWelshFlag is on', async () => {
      //given
      isWelshEnabledForMainCase.mockResolvedValue(true);
      const documentName = 'claimant_test_000MC001.pdf';
      const claim = new Claim();
      claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DIRECTIONS_QUESTIONNAIRE);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.CLAIMANT_DQ',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant seal claim', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.SEALED_CLAIM);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.SEALED_CLAIM',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant bilingual seal claim', async () => {
      //given
      isWelshEnabledForMainCase.mockResolvedValue(false);
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.CLAIM_ISSUE_TRANSLATED_DOCUMENT);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.SEALED_CLAIM',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant unseal claim', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.CLAIMANT_CLAIM_FORM);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.UNSEALED_CLAIM',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should return empty array for defendant access to claimant unseal claim', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseRole = CaseRole.DEFENDANT;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.CLAIMANT_CLAIM_FORM);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedResult = new DocumentsViewComponent('Claimant', []);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant draft claim', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DRAFT_CLAIM_FORM);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DRAFT_CLAIM',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should return empty array for defendant access to claimant draft claim', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseRole = CaseRole.DEFENDANT;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DRAFT_CLAIM_FORM);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedResult = new DocumentsViewComponent('Claimant', []);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant particulars of claim', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      claim.specParticularsOfClaimDocumentFiles = setUpDocument(documentName);
      claim.submittedDate = new Date('2022-06-21T14:15:19');
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.PARTICULARS_CLAIM',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant timeline', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      claim.specClaimTemplateDocumentFiles = setUpDocument(documentName);
      claim.submittedDate = new Date('2022-06-21T14:15:19');
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.CLAIMANT_TIMELINE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for claimant response to defence', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.applicant1DefenceResponseDocumentSpec = {
        file: setUpDocument(documentName),
      };
      claim.claimantResponse.submittedDate = new Date('2022-06-21T14:15:19');
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.RESPOND_TO_DEFENCE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for request for reconsideration claimant', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpCaseDocument(documentName, DocumentType.REQUEST_FOR_RECONSIDERATION);
      claim.caseProgression = new CaseProgression();
      claim.caseProgression.requestForReconsiderationDocument = document;
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MICRO_TEXT',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Get Defendant Documents', () => {
    const claimId = 'test2';
    const documentUrl = '/case/test2/view-documents/71582e35-300e-4294-a604-35d8cabc33de';
    it('should get empty array if there is no data', async () => {
      //given
      const claim = new Claim();
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedResult = new DocumentsViewComponent('Defendant', []);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for defendant response', async () => {
      //given
      const documentName = 'test_response_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.YES;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.SEALED_CLAIM);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DEFENDANT_RESPONSE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for the original doc of notice of discontinuance if courtPermission is not needed ', async () => {
      //given
      const documentName = 'test_response_000MC001.pdf';
      const claim = new Claim();
      claim.courtPermissionNeeded = YesNoUpperCase.NO;
      (isWelshEnabledForMainCase as jest.Mock).mockReturnValueOnce(true);
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.NOTICE_OF_DISCONTINUANCE_DEFENDANT);
      claim.respondent1NoticeOfDiscontinueAllPartyViewDoc = document.value;
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.NOTICE_OF_DISCONTINUANCE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for the original doc of notice of discontinuance', async () => {
      //given
      const documentName = 'test_response_000MC001.pdf';
      const claim = new Claim();
      claim.confirmOrderGivesPermission = YesNoUpperCase.YES;
      (isWelshEnabledForMainCase as jest.Mock).mockReturnValueOnce(true);
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.NOTICE_OF_DISCONTINUANCE_DEFENDANT);
      claim.respondent1NoticeOfDiscontinueAllPartyViewDoc = document.value;
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.NOTICE_OF_DISCONTINUANCE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for the translated doc of notice of discontinuance', async () => {
      //given
      const documentName = 'test_response_000MC001.pdf';
      const claim = new Claim();
      claim.confirmOrderGivesPermission = YesNoUpperCase.YES;
      (isWelshEnabledForMainCase as jest.Mock).mockReturnValueOnce(true);
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.NOTICE_OF_DISCONTINUANCE_DEFENDANT_TRANSLATED_DOCUMENT);
      claim.respondent1NoticeOfDiscontinueAllPartyTranslatedDoc = document.value;
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.NOTICE_OF_DISCONTINUANCE_TRANSLATED',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for the translated doc of notice of discontinuance if courtPermission is not needed ', async () => {
      //given
      const documentName = 'test_response_000MC001.pdf';
      const claim = new Claim();
      claim.courtPermissionNeeded = YesNoUpperCase.NO;
      (isWelshEnabledForMainCase as jest.Mock).mockReturnValueOnce(true);
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.NOTICE_OF_DISCONTINUANCE_DEFENDANT_TRANSLATED_DOCUMENT);
      claim.respondent1NoticeOfDiscontinueAllPartyTranslatedDoc = document.value;
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.NOTICE_OF_DISCONTINUANCE_TRANSLATED',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for defendant stitched response', async () => {
      //given
      const documentName = 'test_response_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.YES;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DEFENDANT_DEFENCE);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DEFENDANT_RESPONSE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for defendant stitched response when welsh enabled', async () => {
      //given
      isWelshEnabledForMainCase.mockResolvedValue(true);
      const documentName = 'test_response_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.YES;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DEFENDANT_DEFENCE);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DEFENDANT_RESPONSE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for defendant lip response', async () => {
      //given
      isWelshEnabledForMainCase.mockResolvedValue(false);
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.NO;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DEFENDANT_DEFENCE);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DEFENDANT_RESPONSE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for defendant lip bilingual response', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.NO;
      claim.claimBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DEFENCE_TRANSLATED_DOCUMENT);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DEFENDANT_RESPONSE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for defendant lip english response when defendant is bilingual', async () => {
      //given
      isWelshEnabledForMainCase.mockResolvedValue(true);
      const documentName = 'test_response_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.NO;
      claim.claimBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DEFENDANT_DEFENCE);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DEFENDANT_RESPONSE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for defendant dq', async () => {
      //given
      const documentName = 'defendant_test_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.NO;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DIRECTIONS_QUESTIONNAIRE);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DEFENDANT_DQ',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for support document', async () => {
      //given
      const documentName = 'defendant_test_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.NO;
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DIRECTIONS_QUESTIONNAIRE);
      claim.defendantResponseDocuments = new Array(document);
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DEFENDANT_SUPPORT_DOC',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for request for reconsideration defendant', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpCaseDocument(documentName, DocumentType.REQUEST_FOR_RECONSIDERATION);
      claim.caseProgression = new CaseProgression();
      claim.caseProgression.requestForReconsiderationDocumentRes = document;
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MICRO_TEXT',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Get Court Documents', () => {
    const claimId = 'test3';
    const documentUrl = '/case/test3/view-documents/71582e35-300e-4294-a604-35d8cabc33de';
    it('should get empty array if there is no data', async () => {
      //given
      const claim = new Claim();
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedResult = new DocumentsViewComponent('CourtDocument', []);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for standard directions order', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.SDO_ORDER);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.STANDARD_DIRECTIONS_ORDER',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for translated standard directions order', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.SDO_TRANSLATED_DOCUMENT);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.TRANSLATED_STANDARD_DIRECTIONS_ORDER',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for lip manual determination', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.LIP_MANUAL_DETERMINATION);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DETERMINATION_REQUEST',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for lip translated manual determination', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.MANUAL_DETERMINATION_TRANSLATED_DOCUMENT);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.TRANSLATED_DETERMINATION_REQUEST',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for ccj admission', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.CCJ_REQUEST_ADMISSION);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.CCJ_REQUEST',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should not get data array for ccj admission', async () => {
      //given
      (isJudgmentOnlineLive as jest.Mock).mockReturnValueOnce(true);
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.CCJ_REQUEST_ADMISSION);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      expect(result.documents.length).toEqual(0);
    });

    it('should get data array for claimant response receipt', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.INTERLOCUTORY_JUDGEMENT);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.CLAIMANT_RESPONSE_RECEIPT',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for translated claimant response receipt', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.INTERLOC_JUDGMENT_TRANSLATED_DOCUMENT);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.TRANSLATED_CLAIMANT_RESPONSE_RECEIPT',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for ccj determination', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.CCJ_REQUEST_DETERMINATION);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.CCJ_REQUEST',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for settle agreement', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.SETTLEMENT_AGREEMENT);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.SETTLEMENT_AGREEMENT',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for translated settle agreement', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.SETTLEMENT_AGREEMENT_TRANSLATED_DOCUMENT);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.TRANSLATED_SETTLEMENT_AGREEMENT',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for Claimant Trial Arrangements', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseProgression = new CaseProgression();
      claim.caseProgression.claimantTrialArrangements = new TrialArrangements();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.TRIAL_READY_DOCUMENT);
      claim.caseProgression.claimantTrialArrangements.trialArrangementsDocument = document;
      //When
      const result = await getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.TRIAL_ARRANGEMENTS',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Claimant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for Claimant Trial Arrangements', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseProgression = new CaseProgression();
      claim.caseProgression.defendantTrialArrangements = new TrialArrangements();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.TRIAL_READY_DOCUMENT);
      claim.caseProgression.defendantTrialArrangements.trialArrangementsDocument = document;
      //When
      const result = await getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.TRIAL_ARRANGEMENTS',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for decision on reconsideration', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DECISION_MADE_ON_APPLICATIONS);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DECISION_ON_RECONSIDERATION',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for translated decision on Reconsideration', async () => {

      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.DECISION_MADE_ON_APPLICATIONS_TRANSLATED);
      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DECISION_ON_RECONSIDERATION_TRANSLATED',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for translated order', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.ORDER_NOTICE_TRANSLATED_DOCUMENT);

      claim.systemGeneratedCaseDocuments = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.TRANSLATED_ORDER',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for final order', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseProgression = new CaseProgression();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.JUDGE_FINAL_ORDER);

      claim.caseProgression.finalOrderDocumentCollection = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.FINAL_ORDER',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for translated final order', async () => {
      //given
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.caseProgression = new CaseProgression();
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.FINAL_ORDER_TRANSLATED_DOCUMENT);

      claim.caseProgression.finalOrderDocumentCollection = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.TRANSLATED_FINAL_ORDER',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('CourtDocument', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });

    it('should not get general application doc', async () => {
      //given
      (isGaForLipsEnabled as jest.Mock).mockReturnValueOnce(false);
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      const documentName = 'test_000MC001.pdf';
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.ORDER_NOTICE_TRANSLATED_DOCUMENT);
      claim.generalOrderDocClaimant = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      expect(result.documents.length).toEqual(0);
    });

    it('should get general application doc', async () => {
      //given
      (isGaForLipsEnabled as jest.Mock).mockReturnValueOnce(true);
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      const documentName = 'test_000MC001.pdf';
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.ORDER_NOTICE_TRANSLATED_DOCUMENT);
      claim.generalOrderDocClaimant = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      expect(result.documents.length).toEqual(1);
    });

    it('should get general application doc from def', async () => {
      //given
      (isGaForLipsEnabled as jest.Mock).mockReturnValueOnce(true);
      const claim = new Claim();
      claim.caseRole = CaseRole.DEFENDANT;
      const documentName = 'test_000MC001.pdf';
      const document = setUpMockSystemGeneratedCaseDocument(documentName, DocumentType.ORDER_NOTICE_TRANSLATED_DOCUMENT);
      claim.generalOrderDocRespondentSol = new Array(document);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      expect(result.documents.length).toEqual(1);
    });

    it('should get court officer order when caseworkerEvent toggle on', async () => {
      //given
      (isCaseWorkerEventsEnabled as jest.Mock).mockReturnValueOnce(true);
      const claim = new Claim();
      claim.caseProgression = new CaseProgression();
      const documentName = 'test_000MC001.pdf';
      claim.caseProgression.courtOfficerOrder = setUpCaseDocument(documentName, DocumentType.ORDER_NOTICE_TRANSLATED_DOCUMENT);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      expect(result.documents.length).toEqual(1);
    });

    it('should get court officer order from collection when caseworkerEvent toggle on', async () => {
      //given
      (isCaseWorkerEventsEnabled as jest.Mock).mockReturnValueOnce(true);
      const claim = new Claim();
      claim.caseProgression = new CaseProgression();
      claim.caseProgression.courtOfficersOrders =
        [new FinalOrderDocumentCollection(setUpCourtOfficersOrder().id, setUpCourtOfficersOrder().value),
          new FinalOrderDocumentCollection(setUpTranslatedCourtOfficersOrder().id, setUpTranslatedCourtOfficersOrder().value)];
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      const expectedDocument1 = new DocumentInformation(
        undefined,
        '26 April 2023',
        new DocumentLinkInformation('/case/test3/view-documents/33c8ba72-6193-48ca-88cd-b57741c558c4', '2025-08-04_hearing-centre-admin-01@example.com Admin.pdf'),
      );
      const expectedDocument2 = new DocumentInformation(
        undefined,
        '26 April 2023',
        new DocumentLinkInformation('/case/test3/view-documents/8b1a0c1c-9b25-42ac-b266-8e6b6c4b4432', 'translated_court_off_order.pdf'),
      );
      //Then
      expect(result.documents.length).toEqual(2);
      expect(result.documents[0]).toEqual(expectedDocument1);
      expect(result.documents[1]).toEqual(expectedDocument2);
    });

    it('should not get court officer order when caseworkerEvent toggle off', async () => {
      //given
      (isCaseWorkerEventsEnabled as jest.Mock).mockReturnValueOnce(false);
      const claim = new Claim();
      claim.caseProgression = new CaseProgression();
      const documentName = 'test_000MC001.pdf';
      claim.caseProgression.courtOfficerOrder = setUpCaseDocument(documentName, DocumentType.ORDER_NOTICE_TRANSLATED_DOCUMENT);
      //When
      const result = await getCourtDocuments(claim, claimId, 'en');
      //Then
      expect(result.documents.length).toEqual(0);
    });
  });

  function setUpMockSystemGeneratedCaseDocument(documentName: string, documentType: DocumentType) {
    return {
      id: '1',
      'value': {
        'createdBy': 'Civil',
        'documentLink': {
          'document_url': 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de',
          'document_filename': documentName,
          'document_binary_url': 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de/binary',
        },
        'documentName': documentName,
        'documentSize': 45794,
        'documentType': documentType,
        'createdDatetime': new Date('2022-06-21T14:15:19'),
      },
    };
  }

  function setUpCaseDocument(documentName: string, documentType: DocumentType) : CaseDocument {
    return {
      'createdBy': 'Civil',
      'documentLink': {
        'document_url': 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de',
        'document_filename': documentName,
        'document_binary_url': 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de/binary',
      },
      'documentName': documentName,
      'documentSize': 45794,
      'documentType': documentType,
      'createdDatetime': new Date('2022-06-21T14:15:19'),
    };
  }

  function setUpCourtOfficersOrder() {
    return {
      id: 'c38cf5d3-69a5-4643-a5f7-06c0e3343e82',
      'value': {
        'createdBy': 'Civil',
        'documentLink': {
          'category_id': 'caseManagementOrders',
          'document_url': 'http://dm-store:8080/documents/33c8ba72-6193-48ca-88cd-b57741c558c4',
          'document_filename': '2025-08-04_hearing-centre-admin-01@example.com Admin.pdf',
          'document_binary_url': 'http://dm-store:8080/documents/33c8ba72-6193-48ca-88cd-b57741c558c4/binary',
        },
        'documentName': 'Order_2025-08-04.pdf',
        'documentSize': 20222,
        'documentType': DocumentType.COURT_OFFICER_ORDER,
        'createdDatetime': FIXED_DATE,
      },
    };
  }

  function setUpTranslatedCourtOfficersOrder() {
    return {
      'id': '3dd8b32b-4510-4345-879f-e94a4503b692',
      'value': {
        'createdBy': 'Civil',
        'documentLink': {
          'category_id': 'caseManagementOrders',
          'document_url': 'http://dm-store:8080/documents/8b1a0c1c-9b25-42ac-b266-8e6b6c4b4432',
          'document_filename': 'translated_court_off_order.pdf',
          'document_binary_url': 'http://dm-store:8080/documents/8b1a0c1c-9b25-42ac-b266-8e6b6c4b4432/binary',
        },
        'documentName': 'translated_court_off_order.pdf',
        'documentSize': 0,
        'documentType': DocumentType.COURT_OFFICER_ORDER_TRANSLATED_DOCUMENT,
        'createdDatetime': FIXED_DATE,
      },
    };
  }

  function setUpDocument(documentName: string) : Document {
    return {
      document_url: 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de',
      document_filename: documentName,
      document_binary_url: 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de/binary',
    };
  }
});
