import {Response} from 'express';
import partnerPensionController from '../../../../../../../main/routes/features/response/statementOfMeans/partner/partnerPensionController';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_DISABILITY_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {PartnerPensionService} from 'services/features/response/statementOfMeans/partner/partnerPensionService';
import {DisabilityService} from 'services/features/response/statementOfMeans/disabilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Partner Pension', () => {
  const getHandler = getRouteHandler(partnerPensionController, 'get');
  const postHandler = getRouteHandler(partnerPensionController, 'post');
  const viewPath = 'features/response/statementOfMeans/partner/partner-pension';
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
    jest.spyOn(PartnerPensionService.prototype, 'getPartnerPension').mockResolvedValue(new GenericForm(new GenericYesNo()));
    jest.spyOn(PartnerPensionService.prototype, 'savePartnerPension').mockResolvedValue(undefined);
    jest.spyOn(DisabilityService.prototype, 'getDisability').mockResolvedValue(new GenericForm(new GenericYesNo(YesNo.YES)));
  });

  describe('on GET', () => {
    it('should render citizen partner pension page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should render partner pension page when statement of means is missing', async () => {
      jest.spyOn(PartnerPensionService.prototype, 'getPartnerPension').mockResolvedValue(new GenericForm(new GenericYesNo()));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      jest.spyOn(PartnerPensionService.prototype, 'getPartnerPension').mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect when redis claim is undefined', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(PartnerPensionService.prototype.savePartnerPension).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PARTNER_DISABILITY_URL));
    });

    it('should redirect when no and defendant disabled is yes', async () => {
      jest.spyOn(DisabilityService.prototype, 'getDisability').mockResolvedValue(new GenericForm(new GenericYesNo(YesNo.YES)));
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PARTNER_DISABILITY_URL));
    });

    it('should redirect when no and defendant disabled is no', async () => {
      jest.spyOn(DisabilityService.prototype, 'getDisability').mockResolvedValue(new GenericForm(new GenericYesNo(YesNo.NO)));
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEPENDANTS_URL));
    });

    it('should redirect when yes and defendant disabled is no', async () => {
      jest.spyOn(DisabilityService.prototype, 'getDisability').mockResolvedValue(new GenericForm(new GenericYesNo(YesNo.NO)));
      req.body = {option: YesNo.YES};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEPENDANTS_URL));
    });

    it('should redirect when yes and defendant disabled is yes', async () => {
      jest.spyOn(DisabilityService.prototype, 'getDisability').mockResolvedValue(new GenericForm(new GenericYesNo(YesNo.YES)));
      req.body = {option: YesNo.YES};

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

    it('should redirect to partner disability page when no and statement of means is missing', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_PARTNER_DISABILITY_URL));
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      jest.spyOn(PartnerPensionService.prototype, 'savePartnerPension').mockRejectedValue(error);
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
