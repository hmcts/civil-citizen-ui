import {Request, Response} from 'express';
import disabilityController from '../../../../../../main/routes/features/response/statementOfMeans/disabilityController';
import {CITIZEN_RESIDENCE_URL, CITIZEN_SEVERELY_DISABLED_URL} from 'routes/urls';
import {DisabilityService} from 'services/features/response/statementOfMeans/disabilityService';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Disability', () => {
  const getHandler = getRouteHandler(disabilityController, 'get');
  const postHandler = getRouteHandler(disabilityController, 'post');
  const viewPath = 'features/response/statementOfMeans/disability';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let mockGetDisability: jest.SpyInstance;
  let mockSaveDisability: jest.SpyInstance;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetDisability = jest.spyOn(DisabilityService.prototype, 'getDisability')
      .mockResolvedValue(new GenericForm(new GenericYesNo()));
    mockSaveDisability = jest.spyOn(DisabilityService.prototype, 'saveDisability')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should render the disability page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect(mockGetDisability).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetDisability.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDisability).not.toHaveBeenCalled();
    });

    it('should save and redirect to residence when no is selected', async () => {
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDisability).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_RESIDENCE_URL));
    });

    it('should save and redirect to severe disability when yes is selected', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDisability).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_SEVERELY_DISABLED_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveDisability.mockRejectedValue(error);
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
