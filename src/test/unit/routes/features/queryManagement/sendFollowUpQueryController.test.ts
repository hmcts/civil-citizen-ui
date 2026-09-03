import {Request, Response} from 'express';
import sendFollowUpQueryController from '../../../../../main/routes/features/queryManagement/sendFollowUpQueryController';
import {
  deleteQueryManagement,
  getCancelUrl,
  getQueryManagement,
  getSummaryList,
  saveQueryManagement,
} from 'services/features/queryManagement/queryManagementService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {QueryManagement} from 'form/models/queryManagement/queryManagement';
import {QM_FOLLOW_UP_CYA} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/queryManagement/queryManagementService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('common/utils/fileUploadUtils', () => ({
  createMulterErrorMiddlewareForSingleField: jest.fn(() => (req: unknown, res: unknown, next: () => void) => next()),
  getFileUploadErrorsForSource: jest.fn(() => []),
  FILE_UPLOAD_SOURCE: {QM_SEND_FOLLOW_UP: 'QM_SEND_FOLLOW_UP'},
}));
jest.mock('services/features/generalApplication/uploadEvidenceDocumentService', () => ({
  handleMulterError: jest.fn(() => false),
}));

describe('Send follow up query Controller', () => {
  const getHandler = getRouteHandler(sendFollowUpQueryController, 'get');
  const postHandler = getRouteHandler(sendFollowUpQueryController, 'post');
  const viewPath = 'features/queryManagement/sendFollowUpQuery';
  const claimId = '12345';
  const queryId = 'query-1';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetQueryManagement = getQueryManagement as jest.Mock;
  const mockSaveQueryManagement = saveQueryManagement as jest.Mock;
  const mockDeleteQueryManagement = deleteQueryManagement as jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId, queryId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    mockGetQueryManagement.mockResolvedValue(new QueryManagement());
    mockSaveQueryManagement.mockResolvedValue(undefined);
    mockDeleteQueryManagement.mockResolvedValue(undefined);
    (getCancelUrl as jest.Mock).mockReturnValue('/dashboard');
    (getSummaryList as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the follow up form', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect(mockDeleteQueryManagement).not.toHaveBeenCalled();
    });

    it('should clear previous QM data when linkFrom=start', async () => {
      req.query = {linkFrom: 'start'};

      await getHandler(req as Request, res as unknown as Response, next);

      expect(mockDeleteQueryManagement).toHaveBeenCalled();
    });

    it('should call next when loading fails', async () => {
      const error = new Error('redis failure');
      mockGetQueryManagement.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the message is empty', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect(mockSaveQueryManagement).not.toHaveBeenCalled();
    });

    it('should save and redirect to CYA when the message is valid', async () => {
      req.body = {messageDetails: 'Please follow up on this query'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveQueryManagement).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, QM_FOLLOW_UP_CYA).replace(':queryId', queryId),
      );
    });
  });
});
