import {Response} from 'express';
import theirPdfTimelineDownloadController from '../../../../../../main/routes/features/response/timelineOfEvents/theirPdfTimelineDownloadController';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import {FileResponse} from 'models/FileResponse';
import * as documentUtils from '../../../../../../main/common/utils/downloadUtils';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Their PDF timeline controller', () => {
  const getHandler = getRouteHandler(theirPdfTimelineDownloadController, 'get');
  const claimId = '123';
  const documentId = '111';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      params: {id: claimId, documentId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should display the pdf', async () => {
      const mockDisplayPDFDocument = jest.spyOn(documentUtils, 'displayPDF').mockImplementation();
      const pdfDocument = new FileResponse('application/pdf', 'example.pdf', Buffer.from('111'));
      jest.spyOn(CivilServiceClient.prototype, 'retrieveDocument').mockResolvedValue(pdfDocument);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(CivilServiceClient.prototype.retrieveDocument).toHaveBeenCalledWith(req, documentId);
      expect(mockDisplayPDFDocument).toHaveBeenCalledWith(res, pdfDocument);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when retrieving the document fails', async () => {
      const error = new Error('error');
      jest.spyOn(CivilServiceClient.prototype, 'retrieveDocument').mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
