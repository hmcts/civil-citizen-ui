import {Response} from 'express';
import betweenSixteenAndNineteenController from '../../../../../../../main/routes/features/response/statementOfMeans/dependants/betweenSixteenAndNineteenController';
import {CHILDREN_DISABILITY_URL, CITIZEN_OTHER_DEPENDANTS_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {BetweenSixteenAndNineteenDependants} from 'form/models/statementOfMeans/dependants/betweenSixteenAndNineteenDependants';
import {Claim} from 'models/claim';
import {
  getForm,
  saveFormToDraftStore,
} from 'services/features/response/statementOfMeans/dependants/betweenSixteenAndNineteenService';
import {hasDisabledChildren} from 'services/features/response/statementOfMeans/dependants/childrenDisabilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/dependants/betweenSixteenAndNineteenService', () => ({
  getForm: jest.fn(),
  saveFormToDraftStore: jest.fn(),
}));
jest.mock('services/features/response/statementOfMeans/dependants/childrenDisabilityService', () => ({
  hasDisabledChildren: jest.fn(),
  getChildrenDisability: jest.fn(),
  saveChildrenDisability: jest.fn(),
}));

const mockHasDisabledChildren = hasDisabledChildren as jest.Mock;

describe('Dependant Teenagers', () => {
  const getHandler = getRouteHandler(betweenSixteenAndNineteenController, 'get');
  const postHandler = getRouteHandler(betweenSixteenAndNineteenController, 'post');
  const viewPath = 'features/response/statementOfMeans/dependants/between_16_and_19';
  const claimId = 'aaa';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetForm = getForm as jest.Mock;
  const mockSaveFormToDraftStore = saveFormToDraftStore as jest.Mock;
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
    mockGetForm.mockResolvedValue(new GenericForm(new BetweenSixteenAndNineteenDependants(undefined, 3)));
    mockSaveFormToDraftStore.mockResolvedValue(new Claim());
    mockHasDisabledChildren.mockReturnValue(false);
  });

  describe('on GET', () => {
    it('should render dependent teenagers page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when error thrown', async () => {
      const error = new Error('error');
      mockGetForm.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no number is added', async () => {
      req.body = {};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('value')).toBe('ERRORS.VALID_INTEGER');
    });

    it('should re-render when number is negative', async () => {
      req.body = {value: -1, maxValue: 3};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('value')).toBe('ERRORS.VALID_POSITIVE_NUMBER');
    });

    it('should re-render when number is decimal', async () => {
      req.body = {value: 1.3, maxValue: 3};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('value')).toBe('ERRORS.VALID_INTEGER');
    });

    it('should re-render when number is greater than maxValue', async () => {
      req.body = {value: 4, maxValue: 3};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('value')).toBe('ERRORS.VALID_NUMBER_FOR_PREVIOUS_PAGE');
    });

    it('should redirect to other dependants when hasDisabledChildren returns false and no errors', async () => {
      mockHasDisabledChildren.mockReturnValue(false);
      req.body = {value: 1, maxValue: 3};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_OTHER_DEPENDANTS_URL));
    });

    it('should redirect to children disability when hasDisabledChildren returns true and no errors', async () => {
      mockHasDisabledChildren.mockReturnValue(true);
      req.body = {value: 1, maxValue: 3};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CHILDREN_DISABILITY_URL));
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      mockSaveFormToDraftStore.mockRejectedValue(error);
      req.body = {value: 1, maxValue: 3};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
