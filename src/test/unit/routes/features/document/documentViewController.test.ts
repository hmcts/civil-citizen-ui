import {Response} from 'express';
import documentViewController from 'routes/features/document/documentViewController';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
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
  await getRouteHandler(documentViewController, 'get', CASE_DOCUMENT_VIEW_URL)(
    {
      params: {id: '1234', documentId},
      body: {},
      query: {},
      cookies: {},
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Document view controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on Get', () => {
    it('should view the document inline', async () => {
      const document = fileResponse();
      civilServiceMethods.retrieveDocument.mockResolvedValue(document);

      const {res} = await invoke();

      expect(civilServiceMethods.retrieveDocument).toHaveBeenCalledWith(expect.anything(), documentId);
      expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
        'Content-Type': 'application/json',
        'Content-Disposition': 'inline; filename=example.json',
      }));
      expect(res.end).toHaveBeenCalledWith(document.data);
    });

    it('should pass the error to next when viewing the document fails', async () => {
      const error = new Error('document view failure');
      civilServiceMethods.retrieveDocument.mockRejectedValue(error);

      const {res, next} = await invoke();

      expect(next).toHaveBeenCalledWith(error);
      expect(res.writeHead).not.toHaveBeenCalled();
    });
  });
});
