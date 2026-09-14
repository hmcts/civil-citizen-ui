import {Response} from 'express';
import otherDependantsController from '../../../../../../../main/routes/features/response/statementOfMeans/otherDependants/otherDependantsController';
import {CITIZEN_CARER_URL, CITIZEN_EMPLOYMENT_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {OtherDependants} from 'form/models/statementOfMeans/otherDependants';
import {Claim} from 'models/claim';
import {OtherDependantsService} from 'services/features/response/statementOfMeans/otherDependants/otherDependantsService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn((req: {params?: {id?: string}; session?: {user?: {id?: string}}}) =>
    `${req.params?.id ?? ''}${req.session?.user?.id ?? ''}`),
  getCaseDataFromStore: jest.fn(),
  saveDraftClaim: jest.fn(),
}));

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const claimWithDisabledFlag = (disabled: boolean): Claim => {
  const claim = new Claim();
  jest.spyOn(claim, 'isDefendantSeverelyDisabledOrDependentsDisabled').mockReturnValue(disabled);
  return claim;
};

describe('Other Dependants', () => {
  const getHandler = getRouteHandler(otherDependantsController, 'get');
  const postHandler = getRouteHandler(otherDependantsController, 'post');
  const viewPath = 'features/response/statementOfMeans/otherDependants/other-dependants';
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
    jest.spyOn(OtherDependantsService.prototype, 'getOtherDependants').mockResolvedValue(new OtherDependants());
    jest.spyOn(OtherDependantsService.prototype, 'saveOtherDependants').mockResolvedValue(undefined);
    mockGetCaseData.mockResolvedValue(claimWithDisabledFlag(true));
  });

  describe('on GET', () => {
    it('should render other dependants page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should render other dependants page when option is yes', async () => {
      jest.spyOn(OtherDependantsService.prototype, 'getOtherDependants').mockResolvedValue(new OtherDependants('yes', 1, 'details'));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when get throws', async () => {
      const error = new Error('error');
      jest.spyOn(OtherDependantsService.prototype, 'getOtherDependants').mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should render empty OtherDependants object', async () => {
      jest.spyOn(OtherDependantsService.prototype, 'getOtherDependants').mockResolvedValue(undefined);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });
  });

  describe('on POST', () => {
    it('should re-render when radio box is not selected', async () => {
      req.body = {};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('option')).toBe('ERRORS.VALID_YES_NO_OPTION');
    });

    it('should redirect when no is selected', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDisabledFlag(true));
      req.body = {option: 'no', numberOfPeople: '', details: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_EMPLOYMENT_URL));
    });

    it('should redirect when yes is selected and number of people and details are valid', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDisabledFlag(true));
      req.body = {option: 'yes', numberOfPeople: '1', details: 'Test details'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_EMPLOYMENT_URL));
    });

    it('should redirect employment page when defendant is disabled and severely disabled', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDisabledFlag(true));
      req.body = {option: 'no', numberOfPeople: '', details: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_EMPLOYMENT_URL));
    });

    it('should redirect employment page when partner is selected and disabled', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDisabledFlag(true));
      req.body = {option: 'no', numberOfPeople: '', details: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_EMPLOYMENT_URL));
    });

    it('should redirect employment page when children is existing and any of them is disabled', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDisabledFlag(true));
      req.body = {option: 'no', numberOfPeople: '', details: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_EMPLOYMENT_URL));
    });

    it('should redirect when disability, cohabiting and childrenDisability are no', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDisabledFlag(false));
      req.body = {option: 'no', numberOfPeople: '', details: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_CARER_URL));
    });

    it('should redirect when disability, cohabiting are no and partnerDisability is yes', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDisabledFlag(false));
      req.body = {option: 'no', numberOfPeople: '', details: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_CARER_URL));
    });

    it('should re-render when number of people is undefined', async () => {
      req.body = {option: 'yes', numberOfPeople: '', details: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
    });

    it('should re-render when number of people is negative', async () => {
      req.body = {option: 'yes', numberOfPeople: '-1', details: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('numberOfPeople')).toBe('ERRORS.VALID_STRICTLY_POSITIVE_NUMBER');
    });

    it('should re-render when number of people is valid and details is undefined', async () => {
      req.body = {option: 'yes', numberOfPeople: '1', details: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('details')).toBe('ERRORS.DETAILS_REQUIRED');
    });

    it('should re-render when number of people and details are undefined', async () => {
      req.body = {option: 'yes', numberOfPeople: '', details: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
    });

    it('should re-render when number of people is 0 and details is undefined', async () => {
      req.body = {option: 'yes', numberOfPeople: '0', details: ''};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors()).toBe(true);
    });

    it('should save when we dont have information on redis', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDisabledFlag(true));
      req.body = {option: 'no', numberOfPeople: '1', details: 'Test details'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(OtherDependantsService.prototype.saveOtherDependants).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_EMPLOYMENT_URL));
    });

    it('should call next when save throws', async () => {
      const error = new Error('error');
      jest.spyOn(OtherDependantsService.prototype, 'saveOtherDependants').mockRejectedValue(error);
      req.body = {option: 'no', numberOfPeople: '1', details: 'Test details'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
