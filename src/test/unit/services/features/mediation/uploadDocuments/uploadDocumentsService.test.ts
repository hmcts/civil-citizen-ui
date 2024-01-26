import {Claim} from 'models/claim';
import {
  getUploadDocuments,
  saveUploadDocument,
} from 'services/features/mediation/uploadDocuments/uploadDocumentsService';
import {
  TypeOfDocuments,
  TypeOfMediationDocuments,
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

let claim = new Claim();
const TYPE_OF_DOCUMENTS_DATA = Array.of(new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true));

describe('upload document service For Mediation', () => {

  beforeEach(() => {
    claim = new Claim();
  });

  describe('get UploadDocument data', () => {
    it('should return Upload Document from claim when do not have mediationUploadDocuments', async () => {
      //given
      const expected = new UploadDocuments([]);
      //When
      const result = getUploadDocuments(claim);
      //Then
      expect(result).toEqual(expected);
    });

    it('should return get Upload Document from claim when have mediationUploadDocuments', async () => {
      //given
      claim.mediationUploadDocuments = new UploadDocuments(TYPE_OF_DOCUMENTS_DATA);
      const expected = new UploadDocuments(TYPE_OF_DOCUMENTS_DATA);
      //When
      const result = getUploadDocuments(claim);
      //Then
      expect(result).toEqual(expected);
    });
  });

  describe('save mediation data', () => {
    it('should save data successfully when upload document exists', async () => {
    //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const uploadDocument = new UploadDocuments(TYPE_OF_DOCUMENTS_DATA);
      claim.mediationUploadDocuments = uploadDocument;

      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //when
      await saveUploadDocument('1', uploadDocument.typeOfDocuments, 'typeOfDocuments');
      //then
      expect(spySave).toBeCalledWith('1',claim);

    });
    it('should save data successfully when do not have upload document', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const uploadDocument = new UploadDocuments(TYPE_OF_DOCUMENTS_DATA);
      //claim.mediationUploadDocuments = uploadDocument;

      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //when
      await saveUploadDocument('1', uploadDocument.typeOfDocuments, 'typeOfDocuments');
      //then
      expect(spySave).toBeCalledWith('1',claim);

    });

    it('should upload file', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const uploadDocument = new UploadDocuments(TYPE_OF_DOCUMENTS_DATA);
      //claim.mediationUploadDocuments = uploadDocument;

      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //when
      await saveUploadDocument('1', uploadDocument.typeOfDocuments, 'typeOfDocuments');
      //then
      expect(spySave).toBeCalledWith('1',claim);

    });
  });
});
