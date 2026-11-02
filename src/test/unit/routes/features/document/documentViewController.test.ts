import {Response} from 'express';
import {PassThrough, Readable} from 'stream';
import documentViewController from 'routes/features/document/documentViewController';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {FileStreamResponse} from 'models/FileStreamResponse';
import {AppRequest} from 'models/AppRequest';
import {getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    retrieveDocumentStream: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveDocumentStream: jest.Mock;
};

const documentId = '111';

const fileStreamResponse = (): FileStreamResponse =>
  new FileStreamResponse('application/json', 'example.json', '3', Readable.from(['111']));

const createStreamResponse = () => Object.assign(new PassThrough(), {writeHead: jest.fn()});

const streamToString = async (stream: PassThrough): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString();
};

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
      const document = fileStreamResponse();
      civilServiceMethods.retrieveDocumentStream.mockResolvedValue(document);

      const {res} = await invoke();

      expect(civilServiceMethods.retrieveDocumentStream).toHaveBeenCalledWith(expect.anything(), documentId);
      expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
        'Content-Type': 'application/json',
        'Content-Disposition': 'inline; filename="example.json"; filename*=UTF-8\'\'example.json',
        'Content-Length': '3',
      }));
      expect(await streamToString(res)).toEqual('111');
    });

    it('should pass the error to next when viewing the document fails', async () => {
      const error = new Error('document view failure');
      civilServiceMethods.retrieveDocumentStream.mockRejectedValue(error);

      const {res, next} = await invoke();

      expect(next).toHaveBeenCalledWith(error);
      expect(res.writeHead).not.toHaveBeenCalled();
    });
  });
});
