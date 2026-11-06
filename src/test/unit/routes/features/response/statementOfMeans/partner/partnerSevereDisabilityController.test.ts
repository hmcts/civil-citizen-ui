import {Request, Response} from 'express';
import partnerSevereDisabilityController from '../../../../../../../main/routes/features/response/statementOfMeans/partner/partnerSevereDisabilityController';
import {CITIZEN_DEPENDANTS_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PartnerSevereDisabilityService} from 'services/features/response/statementOfMeans/partner/partnerSevereDisabilityService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Partner severe disability', () => {
  const getHandler = getRouteHandler(partnerSevereDisabilityController, 'get');
  const postHandler = getRouteHandler(partnerSevereDisabilityController, 'post');
  const viewPath = 'features/response/statementOfMeans/partner/partner-severe-disability';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let mockGetPartnerSevereDisability: jest.SpyInstance;
  let mockSavePartnerSevereDisability: jest.SpyInstance;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetPartnerSevereDisability = jest.spyOn(PartnerSevereDisabilityService.prototype, 'getPartnerSevereDisability')
      .mockResolvedValue(new GenericForm(new GenericYesNo()));
    mockSavePartnerSevereDisability = jest.spyOn(PartnerSevereDisabilityService.prototype, 'savePartnerSevereDisability')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should render the partner severe disability page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect(mockGetPartnerSevereDisability).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetPartnerSevereDisability.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSavePartnerSevereDisability).not.toHaveBeenCalled();
    });

    it('should save and redirect to dependants when no is selected', async () => {
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSavePartnerSevereDisability).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEPENDANTS_URL));
    });

    it('should save and redirect to dependants when yes is selected', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSavePartnerSevereDisability).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEPENDANTS_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSavePartnerSevereDisability.mockRejectedValue(error);
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
