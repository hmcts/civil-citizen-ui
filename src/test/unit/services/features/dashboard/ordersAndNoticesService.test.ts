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
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {DocumentType} from 'models/document/documentType';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';

describe('View Orders And Notices Service', () => {

  describe('Get Claimant Documents', () => {
    const claimId = 'test1';
    it('should get empty array if there is no data', async () => {
      //given
      const claim = new Claim();
      //When
      const result = getClaimantDocuments(claim, claimId, 'en');
      //Then
      const expectedResult = new DocumentsViewComponent('Claimant', []);
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
      const result = getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedResult = new DocumentsViewComponent('Defendant', []);
      expect(result).toEqual(expectedResult);
    });

    it('should get data array for defendant response', async () => {
      //given
      const documentName = 'test_response_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.YES;
      const defendantResponse = setUpMockFile(documentName, DocumentType.SEALED_CLAIM);
      claim.systemGeneratedCaseDocuments = new Array(defendantResponse);
      //When
      const result = getDefendantDocuments(claim, claimId, 'en');
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
      const documentName = 'test_000MC001.pdf';
      const claim = new Claim();
      claim.specRespondent1Represented = YesNoUpperCamelCase.NO;
      const defendantResponse = setUpMockFile(documentName, DocumentType.DEFENDANT_DEFENCE);
      claim.systemGeneratedCaseDocuments = new Array(defendantResponse);
      //When
      const result = getDefendantDocuments(claim, claimId, 'en');
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
      claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
      const defendantResponse = setUpMockFile(documentName, DocumentType.DEFENCE_TRANSLATED_DOCUMENT);
      claim.systemGeneratedCaseDocuments = new Array(defendantResponse);
      //When
      const result = getDefendantDocuments(claim, claimId, 'en');
      //Then
      const expectedDocument = new DocumentInformation(
        'PAGES.ORDERS_AND_NOTICES.DEFENDANT_RESPONSE',
        '21 June 2022',
        new DocumentLinkInformation(documentUrl, documentName),
      );
      const expectedResult = new DocumentsViewComponent('Defendant', [expectedDocument]);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('Get Court Documents', () => {
    const claimId = 'test3';
    it('should get empty array if there is no data', async () => {
      //given
      const claim = new Claim();
      //When
      const result = getCourtDocuments(claim, claimId, 'en');
      //Then
      const expectedResult = new DocumentsViewComponent('CourtDocument', []);
      expect(result).toEqual(expectedResult);
    });
  });

  function setUpMockFile(documentName: string, documentType: DocumentType) {
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
});
