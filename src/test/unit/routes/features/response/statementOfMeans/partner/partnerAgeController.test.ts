import {Request, Response} from 'express';
import partnerAgeController from '../../../../../../../main/routes/features/response/statementOfMeans/partner/partnerAgeController';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_DISABILITY_URL, CITIZEN_PARTNER_PENSION_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {PartnerAgeService} from 'services/features/response/statementOfMeans/partner/partnerAgeService';
import {DisabilityService} from 'services/features/response/statementOfMeans/disabilityService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Partner Age', () => {
  const getHandler = getRouteHandler(partnerAgeController, 'get');
  const postHandler = getRouteHandler(partnerAgeController, 'post');
  const viewPath = 'features/response/statementOfMeans/partner/partner-age';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let mockGetPartnerAge: jest.SpyInstance;
  let mockSavePartnerAge: jest.SpyInstance;
  let mockGetDisability: jest.SpyInstance;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetPartnerAge = jest.spyOn(PartnerAgeService.prototype, 'getPartnerAge')
      .mockResolvedValue(new GenericForm(new GenericYesNo()));
    mockSavePartnerAge = jest.spyOn(PartnerAgeService.prototype, 'savePartnerAge')
      .mockResolvedValue(undefined);
    mockGetDisability = jest.spyOn(DisabilityService.prototype, 'getDisability')
      .mockResolvedValue(new GenericForm(new GenericYesNo(YesNo.NO)));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should render the partner age page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect(mockGetPartnerAge).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetPartnerAge.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSavePartnerAge).not.toHaveBeenCalled();
    });

    it('should redirect to partner pension when yes is selected', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSavePartnerAge).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PARTNER_PENSION_URL));
    });

    it('should redirect to partner disability when no is selected and the defendant is disabled', async () => {
      mockGetDisability.mockResolvedValue(new GenericForm(new GenericYesNo(YesNo.YES)));
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PARTNER_DISABILITY_URL));
    });

    it('should redirect to dependants when no is selected and the defendant is not disabled', async () => {
      mockGetDisability.mockResolvedValue(new GenericForm(new GenericYesNo(YesNo.NO)));
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEPENDANTS_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSavePartnerAge.mockRejectedValue(error);
      req.body = {option: 'no'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
