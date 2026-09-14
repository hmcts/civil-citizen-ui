import {Response} from 'express';
import severeDisabilityController from '../../../../../../main/routes/features/response/statementOfMeans/severeDisabilityController';
import {CITIZEN_RESIDENCE_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {SevereDisabilityService} from 'services/features/response/statementOfMeans/severeDisabilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('SevereDisability', () => {
  const getHandler = getRouteHandler(severeDisabilityController, 'get');
  const postHandler = getRouteHandler(severeDisabilityController, 'post');
  const viewPath = 'features/response/statementOfMeans/are-you-severely-disabled';
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
    jest.spyOn(SevereDisabilityService.prototype, 'getSevereDisability').mockResolvedValue(new GenericForm(new GenericYesNo()));
    jest.spyOn(SevereDisabilityService.prototype, 'saveSevereDisability').mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render citizen severe disability page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should render disability page when statement of means is missing', async () => {
      jest.spyOn(SevereDisabilityService.prototype, 'getSevereDisability').mockResolvedValue(new GenericForm(new GenericYesNo()));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      jest.spyOn(SevereDisabilityService.prototype, 'getSevereDisability').mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect when no and statement of means is missing', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_RESIDENCE_URL));
    });

    it('should redirect when no', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(SevereDisabilityService.prototype.saveSevereDisability).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_RESIDENCE_URL));
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

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_RESIDENCE_URL));
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      jest.spyOn(SevereDisabilityService.prototype, 'saveSevereDisability').mockRejectedValue(error);
      req.body = {option: YesNo.YES};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
