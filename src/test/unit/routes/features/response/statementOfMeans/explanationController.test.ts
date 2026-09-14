import {Response} from 'express';
import explanationController from '../../../../../../main/routes/features/response/statementOfMeans/explanationController';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Explanation} from 'form/models/statementOfMeans/explanation';
import {getExplanation, saveExplanation} from 'services/features/response/statementOfMeans/explanationService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/explanationService', () => ({
  getExplanation: jest.fn(),
  saveExplanation: jest.fn(),
}));

describe('Explanation Controller', () => {
  const getHandler = getRouteHandler(explanationController, 'get');
  const postHandler = getRouteHandler(explanationController, 'post');
  const viewPath = 'features/response/statementOfMeans/explanation';
  const claimId = 'aaa';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetExplanation = getExplanation as jest.Mock;
  const mockSaveExplanation = saveExplanation as jest.Mock;
  const renderedForm = () => (res.render as jest.Mock).mock.calls[0][1].form;

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetExplanation.mockResolvedValue(new Explanation());
    mockSaveExplanation.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render explanation page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      mockGetExplanation.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to claim task list page', async () => {
      req.body = {text: 'test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveExplanation).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should re-render on incorrect input', async () => {
      req.body = {};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('text')).toBe('ERRORS.ENTER_AN_EXPLANATION');
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      mockSaveExplanation.mockRejectedValue(error);
      req.body = {text: 'test'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
