import {
  getSummaryList,
  removeDocumentFromRedis,
  saveDocumentsToUploaded,
} from 'services/features/generalApplication/response/respondentUploadEvidenceDocumentsService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {CaseDocument} from 'models/document/caseDocument';
import {summarySection} from 'models/summaryList/summarySections';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';

import * as draftStoreService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));
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

  describe('Remove document', () => {
    it('should remove document successfully', async () => {
      const gaResponse = new GaResponse();
      //Given
      jest.spyOn(draftStoreService, 'getDraftGARespondentResponse').mockImplementation(async () => {
        const uploadDocument = new UploadGAFiles();
        uploadDocument.caseDocument = mockCaseDocument;
        uploadDocument.fileUpload = file;
        gaResponse.uploadEvidenceDocuments.push(uploadDocument);
        gaResponse.uploadEvidenceDocuments.push(uploadDocument);
        return gaResponse;
      });
      const spy = jest.spyOn(draftStoreService, 'saveDraftGARespondentResponse');

      //When
      await removeDocumentFromRedis('123',0);
      //Then
      expect(spy).toBeCalled();
      expect(gaResponse.uploadEvidenceDocuments.length).toEqual(1);
    });
  });
  describe('Get SummaryList', () => {
    it('should get Summary List when has content', async () => {
      //Given
      jest.spyOn(draftStoreService, 'getDraftGARespondentResponse').mockImplementation(async () => {
        const gaResponse = new GaResponse();
        const uploadDocument = new UploadGAFiles();
        uploadDocument.caseDocument = mockCaseDocument;
        uploadDocument.fileUpload = file;
        gaResponse.uploadEvidenceDocuments.push(uploadDocument);
        gaResponse.uploadEvidenceDocuments.push(uploadDocument);
        return gaResponse;
      });
      jest.spyOn(draftStoreService, 'saveDraftGARespondentResponse');
      const formattedSummary = summarySection(
        {
          title: '',
          summaryRows: [],
        });
      //When
      await getSummaryList(formattedSummary, '123', '1', '345');
      //Then
      expect(formattedSummary.summaryList.rows[0].key.text).toEqual('test.text');
      expect(formattedSummary.summaryList.rows[0].actions.items[0].href).toEqual('/case/1/response/general-application/345/upload-documents?id=1');
      expect(formattedSummary.summaryList.rows[0].actions.items[0].text).toEqual('Remove document');
      expect(formattedSummary.summaryList.rows[1].key.text).toEqual('test.text');
      expect(formattedSummary.summaryList.rows[1].actions.items[0].href).toEqual('/case/1/response/general-application/345/upload-documents?id=2');
      expect(formattedSummary.summaryList.rows[1].actions.items[0].text).toEqual('Remove document');
    });
  });

  describe('Save document', () => {
    it('should save document successfully', async () => {
      jest.spyOn(draftStoreService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
      const spy = jest.spyOn(draftStoreService, 'saveDraftGARespondentResponse');
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
      jest.spyOn(draftStoreService, 'getDraftGARespondentResponse').mockResolvedValueOnce(new GaResponse());
      jest.spyOn(draftStoreService, 'saveDraftGARespondentResponse').mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      //Then
      await expect(saveDocumentsToUploaded('123', undefined)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
