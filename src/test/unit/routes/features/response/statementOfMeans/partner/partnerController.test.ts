import {Request, Response} from 'express';
import partnerController from '../../../../../../../main/routes/features/response/statementOfMeans/partner/partnerController';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_AGE_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CohabitingService} from 'services/features/response/statementOfMeans/partner/cohabitingService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Partner', () => {
  const getHandler = getRouteHandler(partnerController, 'get');
  const postHandler = getRouteHandler(partnerController, 'post');
  const viewPath = 'features/response/statementOfMeans/partner/partner';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let mockGetCohabiting: jest.SpyInstance;
  let mockSaveCohabiting: jest.SpyInstance;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetCohabiting = jest.spyOn(CohabitingService.prototype, 'getCohabiting')
      .mockResolvedValue(new GenericForm(new GenericYesNo()));
    mockSaveCohabiting = jest.spyOn(CohabitingService.prototype, 'saveCohabiting')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should render the partner page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect(mockGetCohabiting).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetCohabiting.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveCohabiting).not.toHaveBeenCalled();
    });

    it('should save and redirect to dependants when no is selected', async () => {
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveCohabiting).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEPENDANTS_URL));
    });

    it('should save and redirect to partner age when yes is selected', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveCohabiting).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PARTNER_AGE_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveCohabiting.mockRejectedValue(error);
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
