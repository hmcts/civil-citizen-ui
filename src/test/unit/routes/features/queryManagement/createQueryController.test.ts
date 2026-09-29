import {Request, Response} from 'express';
import createQueryController from '../../../../../main/routes/features/queryManagement/createQueryController';
import {QM_CYA} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {
  getCancelUrl,
  getSummaryList,
  saveQueryManagement,
} from 'services/features/queryManagement/queryManagementService';
import {Claim} from 'models/claim';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('services/features/queryManagement/queryManagementService');
jest.mock('common/utils/fileUploadUtils', () => ({
  createMulterErrorMiddlewareForSingleField: jest.fn(() => (req: unknown, res: unknown, next: () => void) => next()),
  getFileUploadErrorsForSource: jest.fn((): unknown[] => []),
  FILE_UPLOAD_SOURCE: {QM_CREATE_QUERY: 'QM_CREATE_QUERY'},
}));
jest.mock('services/features/generalApplication/uploadEvidenceDocumentService', () => ({
  handleMulterError: jest.fn(() => false),
}));

describe('Create query Controller', () => {
  const getHandler = getRouteHandler(createQueryController, 'get');
  const postHandler = getRouteHandler(createQueryController, 'post');
  const viewPath = 'features/queryManagement/createQuery';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimById = getClaimById as jest.Mock;
  const mockSaveQueryManagement = saveQueryManagement as jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimById.mockResolvedValue(new Claim());
    mockSaveQueryManagement.mockResolvedValue(undefined);
    (getCancelUrl as jest.Mock).mockReturnValue('/dashboard');
    (getSummaryList as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the create query page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
    });
  });

  describe('on POST', () => {
    it('should re-render when required fields are missing', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
    });

    it('should save and redirect to CYA when the form is valid', async () => {
      req.body = {
        messageSubject: 'Hearing date',
        messageDetails: 'A query for the court',
        isHearingRelated: 'no',
      };

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveQueryManagement).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, QM_CYA));
    });
  });
});
