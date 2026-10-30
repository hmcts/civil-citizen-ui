jest.mock('../../../../main/app-instance', () => jest.requireActual('../../../utils/getRouteHandler'));

import {app} from '../../../../main/app-instance';
import {
  saveGADocumentsInDraftStore,
  getGADocumentsFromDraftStore,
  deleteGADocumentsFromDraftStore,
} from 'modules/draft-store/draftGADocumentService';
import {CaseDocument} from 'models/document/caseDocument';
import {FileUpload} from 'models/caseProgression/fileUpload';

const mockDraftStoreClient = {
  set: jest.fn(),
  ttl: jest.fn(),
  expireat: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
};

const redisKey = 'appId123userId456';
const createUploadDocuments = () => [
  {
    caseDocument: {
      documentName: 'Ga document',
      createdBy: 'Applicant',
      documentLink: {
        document_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1046',
        document_binary_url: 'http://dm-store:8080/documents/95de9948-e563-4692-a642-5cdd5b2a1046',
        document_filename: 'ga-document-upload',
      },
      documentType: null,
      documentSize: 123,
    } as CaseDocument,
    fileUpload: {} as FileUpload,
  },
];
let uploadDocuments: ReturnType<typeof createUploadDocuments>;

describe('draftGADocumentService', () => {
  beforeEach(() => {
    Object.values(mockDraftStoreClient).forEach(mock => mock.mockReset());
    app.locals.draftStoreClient = mockDraftStoreClient;
    mockDraftStoreClient.ttl.mockResolvedValue(-1);
    uploadDocuments = createUploadDocuments();
  });

  it('should save GA documents with TTL', async () => {
    await saveGADocumentsInDraftStore(redisKey, uploadDocuments);

    expect(mockDraftStoreClient.ttl).toHaveBeenCalledWith(redisKey + 'DOCKEY');
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith(redisKey + 'DOCKEY', JSON.stringify(uploadDocuments), 'EX', expect.any(Number));
    expect(mockDraftStoreClient.expireat).not.toHaveBeenCalled();
  });

  it('should propagate the original error when saving GA documents fails', async () => {
    const error = new Error('GA document save failed');
    mockDraftStoreClient.set.mockRejectedValueOnce(error);

    await expect(saveGADocumentsInDraftStore(redisKey, uploadDocuments)).rejects.toBe(error);

    expect(mockDraftStoreClient.set).toHaveBeenCalledTimes(1);
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith(redisKey + 'DOCKEY', JSON.stringify(uploadDocuments), 'EX', expect.any(Number));
  });

  it('should retrieve GA documents from draft store', async () => {
    mockDraftStoreClient.get.mockResolvedValueOnce(JSON.stringify(uploadDocuments));

    const result = await getGADocumentsFromDraftStore(redisKey);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith(redisKey + 'DOCKEY');
    expect(result).toEqual(uploadDocuments);
  });

  it('should delete GA documents from draft store successfully', async () => {
    await deleteGADocumentsFromDraftStore(redisKey);
    expect(mockDraftStoreClient.del).toHaveBeenCalledWith(redisKey + 'DOCKEY');
  });
});
