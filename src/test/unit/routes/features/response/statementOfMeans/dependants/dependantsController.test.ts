import {Response} from 'express';
import dependantsController from '../../../../../../../main/routes/features/response/statementOfMeans/dependants/dependantsController';
import {
  CHILDREN_DISABILITY_URL,
  CITIZEN_DEPENDANTS_EDUCATION_URL,
  CITIZEN_OTHER_DEPENDANTS_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Dependants} from 'form/models/statementOfMeans/dependants/dependants';
import {Claim} from 'models/claim';
import dependantsService from 'services/features/response/statementOfMeans/dependants/dependantsService';
import {hasDisabledChildren} from 'services/features/response/statementOfMeans/dependants/childrenDisabilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/dependants/childrenDisabilityService', () => ({
  hasDisabledChildren: jest.fn(),
  getChildrenDisability: jest.fn(),
  saveChildrenDisability: jest.fn(),
}));

const mockHasDisabledChildren = hasDisabledChildren as jest.Mock;

describe('Citizen dependants', () => {
  const getHandler = getRouteHandler(dependantsController, 'get');
  const postHandler = getRouteHandler(dependantsController, 'post');
  const viewPath = 'features/response/statementOfMeans/dependants/dependants';
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
    jest.spyOn(dependantsService, 'getDependants').mockResolvedValue(new Dependants());
    jest.spyOn(dependantsService, 'saveDependants').mockResolvedValue(new Claim());
    mockHasDisabledChildren.mockReturnValue(false);
  });

  describe('on GET', () => {
    it('should render dependants page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      (dependantsService.getDependants as jest.Mock).mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('when Yes option, under11 field filled in, hasDisabledChildren returns false, should redirect to Other Dependants screen', async () => {
      mockHasDisabledChildren.mockReturnValue(false);
      req.body = {declared: 'yes', under11: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_OTHER_DEPENDANTS_URL));
    });

    it('when Yes option and under11 field filled in, hasDisabledChildren returns true, should redirect to children disability screen', async () => {
      mockHasDisabledChildren.mockReturnValue(true);
      req.body = {declared: 'yes', under11: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CHILDREN_DISABILITY_URL));
    });

    it('when Yes option and between16and19 field filled in should redirect to Dependants Education screen', async () => {
      req.body = {declared: 'yes', between16and19: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DEPENDANTS_EDUCATION_URL));
    });

    it('should re-render when Yes option and no number is filled in', async () => {
      req.body = {declared: 'yes', under11: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should re-render when Yes option and invalid under11 input', async () => {
      req.body = {declared: 'yes', under11: '-1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should re-render when Yes option and invalid between11and15 input', async () => {
      req.body = {declared: 'yes', between11and15: '-1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should re-render when Yes option and invalid between16and19 input', async () => {
      req.body = {declared: 'yes', between16and19: '1.5'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      (dependantsService.saveDependants as jest.Mock).mockRejectedValue(error);
      req.body = {declared: 'yes', under11: '1'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
