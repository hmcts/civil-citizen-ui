import {app} from '../../../../main/app';
import {saveGADocumentsInDraftStore, getGADocumentsFromDraftStore} from 'modules/draft-store/draftGADocumentService';
import {UploadGAFiles} from 'common/models/generalApplication/uploadGAFiles';

const mockDraftStoreClient = {
  set: jest.fn(),
  ttl: jest.fn(),
  expireat: jest.fn(),
  get: jest.fn(),
};

app.locals.draftStoreClient = mockDraftStoreClient;

const redisKey = 'appId123userId456';
const documents: UploadGAFiles[] = [];

describe('draftGADocumentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDraftStoreClient.ttl.mockResolvedValue(-1);
  });

  it('should save GA documents with TTL', async () => {
    await saveGADocumentsInDraftStore(redisKey, documents);

    expect(mockDraftStoreClient.ttl).toHaveBeenCalledWith(redisKey + 'DOCKEY');
    expect(mockDraftStoreClient.set).toHaveBeenCalledWith(redisKey + 'DOCKEY', JSON.stringify(documents), 'EX', expect.any(Number));
    expect(mockDraftStoreClient.expireat).not.toHaveBeenCalled();
  });

  it('should retrieve GA documents from draft store', async () => {
    mockDraftStoreClient.get.mockResolvedValueOnce(JSON.stringify(documents));

    const result = await getGADocumentsFromDraftStore(redisKey);

    expect(mockDraftStoreClient.get).toHaveBeenCalledWith(redisKey + 'DOCKEY');
    expect(result).toEqual(documents);
  });
});
