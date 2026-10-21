import {Response} from 'express';
import documentDownloadController from 'routes/features/document/documentDownloadController';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {FileResponse} from 'models/FileResponse';
import {AppRequest} from 'models/AppRequest';
import {getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    retrieveDocument: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveDocument: jest.Mock;
};

const documentId = '111';

const fileResponse = (): FileResponse =>
  new FileResponse('application/json', 'example.json', Buffer.from('111'));

const createStreamResponse = () => ({
  writeHead: jest.fn(),
  end: jest.fn(),
});

const invoke = async () => {
  const res = createStreamResponse();
  const next = jest.fn();
  await getRouteHandler(documentDownloadController, 'get', CASE_DOCUMENT_DOWNLOAD_URL)(
    {
      params: {documentId},
      body: {},
      query: {},
      cookies: {},
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Document download controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on Get', () => {
    it('should download the document', async () => {
      const document = fileResponse();
      civilServiceMethods.retrieveDocument.mockResolvedValue(document);

      const {res} = await invoke();

      expect(civilServiceMethods.retrieveDocument).toHaveBeenCalledWith(expect.anything(), documentId);
      expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=example.json',
      }));
      expect(res.end).toHaveBeenCalledWith(document.data);
    });

    it('should pass the error to next when the download fails', async () => {
      const error = new Error('document download failure');
      civilServiceMethods.retrieveDocument.mockRejectedValue(error);

      const {res, next} = await invoke();

      expect(next).toHaveBeenCalledWith(error);
      expect(res.writeHead).not.toHaveBeenCalled();
    });
  });
});
