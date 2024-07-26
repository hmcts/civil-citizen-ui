import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {
  getSummaryList,
} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {CaseDocument} from 'models/document/caseDocument';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {summarySection} from 'models/summaryList/summarySections';
import {
  buildSummarySection,
  removeSelectedDocument,
  saveDocuments, translateCUItoCCD,
} from 'services/features/generalApplication/additionalInfoUpload/uploadDocumentsForReqMoreInfoService';
import {AppRequest} from 'models/AppRequest';
import {FileUpload} from 'models/caseProgression/fileUpload';

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const mockCaseDocument: CaseDocument = <CaseDocument>{
  createdBy: 'test',
  documentLink: { document_url: 'http://test', document_binary_url: 'http://test/binary', document_filename: 'test.png' },
  documentName: 'test.text',
  documentType: null,
  documentSize: 12345,
  createdDatetime: new Date(),
};
const file = {
  fieldname: 'selectedFile',
  originalname: 'test.text',
  mimetype: 'text/plain',
  size: 123,
  buffer: Buffer.from('Test file content'),
};

describe('Upload Evidence Document service', () => {
  describe('Save document', () => {
    it('should save document successfully', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.generalApplication = new GeneralApplication();
        return claim;
      });
      const req: AppRequest = {
        params: { id: '1', appId: '89' },
      } as unknown as AppRequest;

      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => { return new Claim(); });
      const uploadDocument = new UploadGAFiles();
      uploadDocument.caseDocument = mockCaseDocument;
      uploadDocument.fileUpload = file;
      //When
      await saveDocuments(req, '123', uploadDocument);
      //Then
      expect(spy).toBeCalled();
    });
    it('should throw error when draft store throws error', async () => {
      //Given
      const req: AppRequest = {
        params: { id: '1', appId: '89' },
      } as unknown as AppRequest;
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      //When
      mockSaveClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveDocuments(req, '123', undefined)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
  describe('Remove document', () => {
    it('should remove document successfully', async () => {
      const claim = new Claim();
      //Given
      mockGetCaseData.mockImplementation(async () => {
        claim.generalApplication = new GeneralApplication();
        const uploadDocument = new UploadGAFiles();
        uploadDocument.caseDocument = mockCaseDocument;
        uploadDocument.fileUpload = file;
        claim.generalApplication.uploadEvidenceForApplication.push(uploadDocument);
        claim.generalApplication.uploadEvidenceForApplication.push(uploadDocument);
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => { return new Claim(); });

      //When
      await removeSelectedDocument('123', 0);
      //Then
      expect(spy).toBeCalled();
      expect(claim.generalApplication.uploadEvidenceForApplication.length).toEqual(2);
    });
  });
  describe('Get SummaryList', () => {
    it('should get Summary List when has content', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.generalApplication = new GeneralApplication();
        const uploadDocument = new UploadGAFiles();
        uploadDocument.caseDocument = mockCaseDocument;
        uploadDocument.fileUpload = file;
        claim.generalApplication.uploadEvidenceForApplication.push(uploadDocument);
        claim.generalApplication.uploadEvidenceForApplication.push(uploadDocument);
        return claim;
      });
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => { return new Claim(); });
      const formattedSummary = summarySection(
        {
          title: '',
          summaryRows: [],
        });
      //When
      await getSummaryList(formattedSummary, '123', '1');
      //Then
      expect(formattedSummary.summaryList.rows[0].key.text).toEqual('test.text');
      expect(formattedSummary.summaryList.rows[0].actions.items[0].href).toEqual('/case/1/general-application/upload-documents?id=1');
      expect(formattedSummary.summaryList.rows[0].actions.items[0].text).toEqual('Remove document');
      expect(formattedSummary.summaryList.rows[1].key.text).toEqual('test.text');
      expect(formattedSummary.summaryList.rows[1].actions.items[0].href).toEqual('/case/1/general-application/upload-documents?id=2');
      expect(formattedSummary.summaryList.rows[1].actions.items[0].text).toEqual('Remove document');
    });

    describe('Translate CUI to CCD', () => {
      it('should correctly map translate CUI fields to CCD format', () => {
        const uploadDocuments: UploadGAFiles[] = [
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
                document_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1048',
                document_binary_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1048',
                document_filename: 'filename2',
              },
              documentType: null,
              documentSize: 456,
            } as CaseDocument,
            fileUpload: {} as FileUpload,
          },
        ];

        const result = translateCUItoCCD(uploadDocuments);

        expect(result).toHaveLength(2);
        result.forEach((item, index) => {
          expect(item.value.document_url).toBe(uploadDocuments[index].caseDocument.documentLink.document_url);
          expect(item.value.document_binary_url).toBe(uploadDocuments[index].caseDocument.documentLink.document_binary_url);
          expect(item.value.document_filename).toBe(uploadDocuments[index].caseDocument.documentLink.document_filename);
        });
      });
    });
    describe('Build summary Section ', () => {
      it('Should build the summary section: ', () => {
        const uploadDocuments: UploadGAFiles[] = [
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
                document_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1048',
                document_binary_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1048',
                document_filename: 'filename2',
              },
              documentType: null,
              documentSize: 456,
            } as CaseDocument,
            fileUpload: {} as FileUpload,
          },
        ];
        const result = buildSummarySection(uploadDocuments, '1', '123', 'en');
        expect(result).toHaveLength(1);
        expect(result[0].value.html).toContain('<ul class="no-list-style"><li>Additional information1</li><li>Additional information2</li></ul>');
        expect(result[0].actions.items[0].href).toContain('/case/1/general-application/123/upload-additional-documents');
      });
    });
  });
});
