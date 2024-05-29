import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {
  getSummaryList,
  removeDocumentFromRedis,
  saveDocumentsToUploaded,
} from 'services/features/generalApplication/response/respondentUploadEvidenceDocumentsService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {CaseDocument} from 'models/document/caseDocument';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {summarySection} from 'models/summaryList/summarySections';
import {GaResponse} from 'models/generalApplication/response/response';

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

describe('Upload Respondent Evidence Document service', () => {
  describe('Save document', () => {
    it('should save document successfully', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.generalApplication = new GeneralApplication();
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => { return new Claim(); });
      const uploadDocument = new UploadGAFiles();
      uploadDocument.caseDocument = mockCaseDocument;
      uploadDocument.fileUpload = file;
      //When
      await saveDocumentsToUploaded('123', uploadDocument);
      //Then
      expect(spy).toBeCalled();
    });
    it('should throw error when draft store throws error', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      //When
      mockSaveClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveDocumentsToUploaded('123', undefined)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
  describe('Remove document', () => {
    it('should remove document successfully', async () => {
      const claim = new Claim();
      //Given
      mockGetCaseData.mockImplementation(async () => {
        claim.generalApplication = new GeneralApplication();
        claim.generalApplication.gaResponse = new GaResponse();
        const uploadDocument = new UploadGAFiles();
        uploadDocument.caseDocument = mockCaseDocument;
        uploadDocument.fileUpload = file;
        claim.generalApplication.gaResponse.uploadEvidenceDocuments.push(uploadDocument);
        claim.generalApplication.gaResponse.uploadEvidenceDocuments.push(uploadDocument);
        return claim;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const mockSaveClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveClaim.mockResolvedValue(() => { return new Claim(); });

      //When
      await removeDocumentFromRedis('123',0);
      //Then
      expect(spy).toBeCalled();
      expect(claim.generalApplication.gaResponse.uploadEvidenceDocuments.length).toEqual(1);
    });
  });
  describe('Get SummaryList', () => {
    it('should get Summary List when has content', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.generalApplication = new GeneralApplication();
        claim.generalApplication.gaResponse = new GaResponse();
        const uploadDocument = new UploadGAFiles();
        uploadDocument.caseDocument = mockCaseDocument;
        uploadDocument.fileUpload = file;
        claim.generalApplication.gaResponse.uploadEvidenceDocuments.push(uploadDocument);
        claim.generalApplication.gaResponse.uploadEvidenceDocuments.push(uploadDocument);
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
      expect(formattedSummary.summaryList.rows[0].actions.items[0].href).toEqual('/case/1/response/general-application/upload-documents?id=1');
      expect(formattedSummary.summaryList.rows[0].actions.items[0].text).toEqual('Remove document');
      expect(formattedSummary.summaryList.rows[1].key.text).toEqual('test.text');
      expect(formattedSummary.summaryList.rows[1].actions.items[0].href).toEqual('/case/1/response/general-application/upload-documents?id=2');
      expect(formattedSummary.summaryList.rows[1].actions.items[0].text).toEqual('Remove document');
    });
  });
});
