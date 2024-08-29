import {Claim} from 'models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {CaseDocument} from 'models/document/caseDocument';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {
  removeSelectedDocument,
  saveDocuments, translateCUItoCCD,
} from 'services/features/generalApplication/documentUpload/uploadDocumentsService';
import {AppRequest} from 'models/AppRequest';
import {FileUpload} from 'models/caseProgression/fileUpload';
import * as draftService from 'modules/draft-store/draftStoreService';
import * as draftServiceGA from 'modules/draft-store/draftGADocumentService';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/modules/draft-store/draftGADocumentService');

describe('Upload Evidence Document service', () => {
  const mockDataFromStore = jest.spyOn(draftService, 'getCaseDataFromStore');
  const mockGADocDataFromStore = jest.spyOn(draftServiceGA, 'getGADocumentsFromDraftStore');
  let uploadDocuments: UploadGAFiles[];
  beforeEach(() => {
    const claim = new Claim();
    claim.id ='id';
    claim.generalApplication = new GeneralApplication();
    mockDataFromStore.mockResolvedValue(claim);

    uploadDocuments = [
      {
        caseDocument: {
          documentName: 'Additional information1',
          createdBy: 'Applicant',
          documentLink: {
            document_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1046',
            document_binary_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1046',
            document_filename: 'filename1',
          },
          documentType: null,
          documentSize: 123,
        } as CaseDocument,
        fileUpload: {} as FileUpload,
      },
      {
        caseDocument: {
          documentName: 'Additional information2',
          createdBy: 'Applicant',
          documentLink: {
            document_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1047',
            document_binary_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1047',
            document_filename: 'filename2',
          },
          documentType: null,
          documentSize: 1223,
        } as CaseDocument,
        fileUpload: {} as FileUpload,
      },
    ];
    mockGADocDataFromStore.mockResolvedValue(uploadDocuments);
  });

  describe('Save document', () => {
    it('should save document successfully', async () => {
      //Given
      const req: AppRequest = {
        params: { id: '1', appId: '89' },
      } as unknown as AppRequest;

      const spy = jest.spyOn(draftServiceGA, 'saveGADocumentsInDraftStore');
      //When
      await saveDocuments(req, uploadDocuments[0]);
      //Then
      expect(spy).toBeCalled();
    });
    it('should throw error when draft store throws error', async () => {
      //Given
      const req: AppRequest = {
        params: { id: '1', appId: '89' },
      } as unknown as AppRequest;
      const mockSaveDocuments = draftServiceGA.saveGADocumentsInDraftStore as jest.Mock;
      //When
      mockSaveDocuments.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveDocuments(req, undefined)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
  describe('Remove document', () => {
    it('should remove document successfully', async () => {
      //Given
      const spy = jest.spyOn(draftServiceGA, 'saveGADocumentsInDraftStore');
      const mockSaveDocument = draftServiceGA.saveGADocumentsInDraftStore as jest.Mock;
      mockSaveDocument.mockResolvedValue(() => { return uploadDocuments; });

      //When
      await removeSelectedDocument('123', 0);
      //Then
      expect(spy).toBeCalled();
      expect(uploadDocuments.length).toEqual(1);
    });
  });
  describe('Get SummaryList', () => {

    describe('Translate CUI to CCD', () => {
      it('should correctly map translate CUI fields to CCD format', () => {
        const result = translateCUItoCCD(uploadDocuments);

        expect(result).toHaveLength(2);
        result.forEach((item, index) => {
          expect(item.value.document_url).toBe(uploadDocuments[index].caseDocument.documentLink.document_url);
          expect(item.value.document_binary_url).toBe(uploadDocuments[index].caseDocument.documentLink.document_binary_url);
          expect(item.value.document_filename).toBe(uploadDocuments[index].caseDocument.documentLink.document_filename);
        });
      });
    });

  });
});
