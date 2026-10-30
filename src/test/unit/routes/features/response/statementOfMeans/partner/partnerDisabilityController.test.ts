import {Request, Response} from 'express';
import partnerDisabilityController from '../../../../../../../main/routes/features/response/statementOfMeans/partner/partnerDisabilityController';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_SEVERE_DISABILITY_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PartnerDisabilityService} from 'services/features/response/statementOfMeans/partner/partnerDisabilityService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Partner disability', () => {
  const getHandler = getRouteHandler(partnerDisabilityController, 'get');
  const postHandler = getRouteHandler(partnerDisabilityController, 'post');
  const viewPath = 'features/response/statementOfMeans/partner/partner-disability';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let mockGetPartnerDisability: jest.SpyInstance;
  let mockSavePartnerDisability: jest.SpyInstance;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetPartnerDisability = jest.spyOn(PartnerDisabilityService.prototype, 'getPartnerDisability')
      .mockResolvedValue(new GenericForm(new GenericYesNo()));
    mockSavePartnerDisability = jest.spyOn(PartnerDisabilityService.prototype, 'savePartnerDisability')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should render the partner disability page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect(mockGetPartnerDisability).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetPartnerDisability.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSavePartnerDisability).not.toHaveBeenCalled();
    });

    it('should save and redirect to dependants when no is selected', async () => {
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSavePartnerDisability).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEPENDANTS_URL));
    });

    it('should save and redirect to partner severe disability when yes is selected', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSavePartnerDisability).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PARTNER_SEVERE_DISABILITY_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSavePartnerDisability.mockRejectedValue(error);
      req.body = {option: 'yes'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
