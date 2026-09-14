import {Response} from 'express';
import childrenDisabilityController from '../../../../../../../main/routes/features/response/statementOfMeans/dependants/childrenDisabilityController';
import {CITIZEN_OTHER_DEPENDANTS_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {
  getChildrenDisability,
  saveChildrenDisability,
} from 'services/features/response/statementOfMeans/dependants/childrenDisabilityService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('services/features/response/statementOfMeans/dependants/childrenDisabilityService', () => ({
  getChildrenDisability: jest.fn(),
  saveChildrenDisability: jest.fn(),
  hasDisabledChildren: jest.fn(),
}));

describe('Children Disability', () => {
  const getHandler = getRouteHandler(childrenDisabilityController, 'get');
  const postHandler = getRouteHandler(childrenDisabilityController, 'post');
  const viewPath = 'features/response/statementOfMeans/dependants/children-disability';
  const claimId = 'aaa';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetChildrenDisability = getChildrenDisability as jest.Mock;
  const mockSaveChildrenDisability = saveChildrenDisability as jest.Mock;
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
    mockGetChildrenDisability.mockResolvedValue(new GenericYesNo());
    mockSaveChildrenDisability.mockResolvedValue(undefined);
  });

  describe('on Exception', () => {
    it('should call next when get throws', async () => {
      const error = new Error('error');
      mockGetChildrenDisability.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next when post throws', async () => {
      const error = new Error('error');
      mockSaveChildrenDisability.mockRejectedValue(error);
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on GET', () => {
    it('should render children disability page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should render disability page when statement of means is missing', async () => {
      mockGetChildrenDisability.mockResolvedValue(new GenericYesNo());

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });
  });

  describe('on POST', () => {
    it('should redirect when no and no statement of means', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_OTHER_DEPENDANTS_URL));
    });

    it('should redirect when no', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveChildrenDisability).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_OTHER_DEPENDANTS_URL));
    });

    it('should redirect when yes', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_OTHER_DEPENDANTS_URL));
    });

    it('should re-render on incorrect input', async () => {
      req.body = {};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
      expect(renderedForm().errorFor('option')).toBe('ERRORS.VALID_YES_NO_OPTION');
    });
  });
});
