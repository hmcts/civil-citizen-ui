import {Request, Response} from 'express';
import explanationController from '../../../../../../main/routes/features/response/statementOfMeans/explanationController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Explanation} from 'form/models/statementOfMeans/explanation';
import * as explanationService from 'services/features/response/statementOfMeans/explanationService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/explanationService', () => {
  const actual = jest.requireActual('services/features/response/statementOfMeans/explanationService');
  return {
    ...actual,
    getExplanation: jest.fn(),
    saveExplanation: jest.fn(),
  };
});

describe('Explanation Controller', () => {
  const getHandler = getRouteHandler(explanationController, 'get');
  const postHandler = getRouteHandler(explanationController, 'post');
  const viewPath = 'features/response/statementOfMeans/explanation';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetExplanation = explanationService.getExplanation as jest.Mock;
  const mockSaveExplanation = explanationService.saveExplanation as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetExplanation.mockResolvedValue(new Explanation());
    mockSaveExplanation.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the explanation page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(mockGetExplanation).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetExplanation.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should save and redirect to the response task list', async () => {
      req.body = {text: 'test'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveExplanation).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should re-render when no explanation is entered', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveExplanation).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveExplanation.mockRejectedValue(error);
      req.body = {text: 'test'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
