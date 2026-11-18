import {Request, Response} from 'express';
import childrenDisabilityController from '../../../../../../../main/routes/features/response/statementOfMeans/dependants/childrenDisabilityController';
import {CITIZEN_OTHER_DEPENDANTS_URL} from 'routes/urls';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as childrenDisabilityService from 'services/features/response/statementOfMeans/dependants/childrenDisabilityService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Children Disability', () => {
  const getHandler = getRouteHandler(childrenDisabilityController, 'get');
  const postHandler = getRouteHandler(childrenDisabilityController, 'post');
  const viewPath = 'features/response/statementOfMeans/dependants/children-disability';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let mockGetChildrenDisability: jest.SpyInstance;
  let mockSaveChildrenDisability: jest.SpyInstance;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetChildrenDisability = jest.spyOn(childrenDisabilityService, 'getChildrenDisability')
      .mockResolvedValue(new GenericYesNo());
    mockSaveChildrenDisability = jest.spyOn(childrenDisabilityService, 'saveChildrenDisability')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should render the children disability page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect(mockGetChildrenDisability).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetChildrenDisability.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should save and redirect to other dependants when no is selected', async () => {
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveChildrenDisability).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_OTHER_DEPENDANTS_URL));
    });

    it('should save and redirect to other dependants when yes is selected', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveChildrenDisability).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_OTHER_DEPENDANTS_URL));
    });

    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveChildrenDisability).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveChildrenDisability.mockRejectedValue(error);
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
