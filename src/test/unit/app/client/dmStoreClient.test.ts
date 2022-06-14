import {DmStoreClient} from '../../../../main/app/client/dmStoreClient';
import axios, {AxiosInstance} from 'axios';
import config from 'config';


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const baseUrl: string = config.get('baseUrl');

describe('DM Store Client', () => {
  it('retrieve document by document id', async () => {
    const mockDecumentId = '1234-5678';
    const mockResponse = '<Buffer 25 50 44 46 2d 31 2e 37 0d 0a 25 a1 b3 c5 d7 0d 0a 31 20 30 20 6f 62 6a 0d 0a 3c 3c 2f 41 6e 6e 6f 74 73 5b 20 32 20 30 20 52 20 20 34 20 30 20 52 20>';
    const mockGet = jest.fn().mockResolvedValue({data: mockResponse});
    mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
    const dmStoreClient = new DmStoreClient(baseUrl);
    const actualPdfDocument: Buffer = await dmStoreClient.retrieveDocumentByDocumentId(mockDecumentId);
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: baseUrl,
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    });
    expect(mockGet.mock.calls[0][0]).toEqual(`/documents/${mockDecumentId}/binary`);
    expect(actualPdfDocument.length).toEqual(mockResponse.length);
  });
});
