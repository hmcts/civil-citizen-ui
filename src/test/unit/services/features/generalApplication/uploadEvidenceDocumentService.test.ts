import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {
  getSummaryList,
  redirectIfMulterError,
  removeSelectedDocument,
  saveDocumentsToUploaded,
} from 'services/features/generalApplication/uploadEvidenceDocumentService';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {CaseDocument} from 'models/document/caseDocument';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {summarySection} from 'models/summaryList/summarySections';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');

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
      expect(claim.generalApplication.uploadEvidenceForApplication.length).toEqual(1);
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
    it('should get Summary List for COSC application when has content', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.generalApplication = new GeneralApplication();
        claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID)];
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
      expect(formattedSummary.summaryList.rows[0].actions.items[0].href).toEqual('/case/1/general-application/cosc/upload-documents?id=1');
      expect(formattedSummary.summaryList.rows[0].actions.items[0].text).toEqual('Remove document');
      expect(formattedSummary.summaryList.rows[1].key.text).toEqual('test.text');
      expect(formattedSummary.summaryList.rows[1].actions.items[0].href).toEqual('/case/1/general-application/cosc/upload-documents?id=2');
      expect(formattedSummary.summaryList.rows[1].actions.items[0].text).toEqual('Remove document');
    });
  });
  describe('redirectIfMulterError', () => {
    it('should return false when req has no multerError', () => {
      const req = { body: { action: 'uploadButton' }, session: {} } as any;
      const res = { redirect: jest.fn() } as any;
      expect(redirectIfMulterError(req, res, '/current-url')).toBe(false);
      expect(res.redirect).not.toHaveBeenCalled();
    });
    it('should return false when action is not uploadButton', () => {
      const req = { body: { action: 'continue' }, session: {}, multerError: { code: 'LIMIT_FILE_SIZE' } } as any;
      const res = { redirect: jest.fn() } as any;
      expect(redirectIfMulterError(req, res, '/current-url')).toBe(false);
      expect(res.redirect).not.toHaveBeenCalled();
    });
    it('should set session fileUpload, redirect to currentUrl and return true when multerError and uploadButton', () => {
      const req = { body: { action: 'uploadButton' }, session: {} as any, multerError: { code: 'LIMIT_FILE_SIZE' } } as any;
      const res = { redirect: jest.fn() } as any;
      expect(redirectIfMulterError(req, res, '/current-url')).toBe(true);
      expect(req.session.fileUpload).toBeDefined();
      expect(JSON.parse(req.session.fileUpload)).toHaveLength(1);
      expect(res.redirect).toHaveBeenCalledWith('/current-url');
    });
  });
});
