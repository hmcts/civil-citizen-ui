import {Response} from 'express';
import disabilityController from '../../../../../../main/routes/features/response/statementOfMeans/disabilityController';
import {CITIZEN_RESIDENCE_URL, CITIZEN_SEVERELY_DISABLED_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {DisabilityService} from 'services/features/response/statementOfMeans/disabilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

describe('Disability', () => {
  const getHandler = getRouteHandler(disabilityController, 'get');
  const postHandler = getRouteHandler(disabilityController, 'post');
  const viewPath = 'features/response/statementOfMeans/disability';
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
    jest.spyOn(DisabilityService.prototype, 'getDisability').mockResolvedValue(new GenericForm(new GenericYesNo()));
    jest.spyOn(DisabilityService.prototype, 'saveDisability').mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render citizen disability page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should render disability page when statement of means is missing', async () => {
      jest.spyOn(DisabilityService.prototype, 'getDisability').mockResolvedValue(new GenericForm(new GenericYesNo()));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      jest.spyOn(DisabilityService.prototype, 'getDisability').mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect when no', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(DisabilityService.prototype.saveDisability).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_RESIDENCE_URL));
    });

    it('should re-render on incorrect input', async () => {
      req.body = {};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('option')).toBe('ERRORS.VALID_YES_NO_OPTION');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect when no and statement of means is missing', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_RESIDENCE_URL));
    });

    it('should redirect when yes', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_SEVERELY_DISABLED_URL));
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      jest.spyOn(DisabilityService.prototype, 'saveDisability').mockRejectedValue(error);
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
