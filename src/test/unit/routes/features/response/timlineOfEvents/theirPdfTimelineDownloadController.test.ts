import {Response} from 'express';
import theirPdfTimelineDownloadController from 'routes/features/response/timelineOfEvents/theirPdfTimelineDownloadController';
import {CASE_TIMELINE_DOCUMENTS_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {displayPDF} from 'common/utils/downloadUtils';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('client/civilServiceClient', () => {
  const methods = {
    retrieveDocument: jest.fn(),
  };
  return {CivilServiceClient: jest.fn(() => methods)};
});
jest.mock('common/utils/downloadUtils', () => ({
  displayPDF: jest.fn(),
}));

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  retrieveDocument: jest.Mock;
};

const claimId = '123';
const documentId = '111';

const invoke = async () => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(theirPdfTimelineDownloadController, 'get', CASE_TIMELINE_DOCUMENTS_URL)(
    {
      params: {id: claimId, documentId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Their PDF timeline controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display the downloaded timeline pdf', async () => {
    const pdfDocument = {fileName: 'example.pdf', data: Buffer.from('111')};
    civilServiceMethods.retrieveDocument.mockResolvedValue(pdfDocument);

    const {res} = await invoke();

    expect(civilServiceMethods.retrieveDocument).toHaveBeenCalledWith(expect.anything(), documentId);
    expect(displayPDF).toHaveBeenCalledWith(res, pdfDocument);
  });

  it('should return the error when the document cannot be downloaded', async () => {
    const error = new Error('download failed');
    civilServiceMethods.retrieveDocument.mockRejectedValue(error);

    const {next} = await invoke();

    expect(next).toHaveBeenCalledWith(error);
  });
});
