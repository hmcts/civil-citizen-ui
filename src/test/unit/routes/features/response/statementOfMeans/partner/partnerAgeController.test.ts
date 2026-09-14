import {Response} from 'express';
import partnerAgeController from '../../../../../../../main/routes/features/response/statementOfMeans/partner/partnerAgeController';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_PARTNER_DISABILITY_URL,
  CITIZEN_PARTNER_PENSION_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {PartnerAgeService} from 'services/features/response/statementOfMeans/partner/partnerAgeService';
import {DisabilityService} from 'services/features/response/statementOfMeans/disabilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Partner Age', () => {
  const getHandler = getRouteHandler(partnerAgeController, 'get');
  const postHandler = getRouteHandler(partnerAgeController, 'post');
  const viewPath = 'features/response/statementOfMeans/partner/partner-age';
  const claimId = 'aaa';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
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
    jest.spyOn(PartnerAgeService.prototype, 'getPartnerAge').mockResolvedValue(new GenericForm(new GenericYesNo()));
    jest.spyOn(PartnerAgeService.prototype, 'savePartnerAge').mockResolvedValue(undefined);
    jest.spyOn(DisabilityService.prototype, 'getDisability').mockResolvedValue(new GenericForm(new GenericYesNo(YesNo.YES)));
  });

  describe('on GET', () => {
    it('should render citizen partner age page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should render partner age page when statement of means is missing', async () => {
      jest.spyOn(PartnerAgeService.prototype, 'getPartnerAge').mockResolvedValue(new GenericForm(new GenericYesNo()));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      jest.spyOn(PartnerAgeService.prototype, 'getPartnerAge').mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect when redis claim is undefined', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(PartnerAgeService.prototype.savePartnerAge).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PARTNER_DISABILITY_URL));
    });

    it('should redirect when no and defendant disabled is yes', async () => {
      jest.spyOn(DisabilityService.prototype, 'getDisability').mockResolvedValue(new GenericForm(new GenericYesNo(YesNo.YES)));
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PARTNER_DISABILITY_URL));
    });

    it('should re-render on incorrect input', async () => {
      req.body = {};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('option')).toBe('ERRORS.VALID_YES_NO_OPTION');
    });

    it('should redirect when yes', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PARTNER_PENSION_URL));
    });

    it('should redirect when no and defendant disabled is no', async () => {
      jest.spyOn(DisabilityService.prototype, 'getDisability').mockResolvedValue(new GenericForm(new GenericYesNo(YesNo.NO)));
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEPENDANTS_URL));
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      jest.spyOn(PartnerAgeService.prototype, 'savePartnerAge').mockRejectedValue(error);
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
