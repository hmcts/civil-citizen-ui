import {Response} from 'express';
import debtsController from '../../../../../../../main/routes/features/response/statementOfMeans/debts/debtsController';
import {CITIZEN_MONTHLY_EXPENSES_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {
  buildDebtFormNo,
  buildDebtFormUndefined,
  buildDebtFormYes,
  buildDebtFormYesWithDebtEmpty,
  buildDebtFormYesWithEmptyItems,
  buildDebtFormYesWithoutItems,
  buildDebtFormYesWithTotalOwnedEmpty,
  buildDebtFormYesWithTotalOwnedInvalid,
  buildDebtFormYesWithTotalOwnedZero,
} from '../../../../../../utils/mockForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn((req: {params?: {id?: string}; session?: {user?: {id?: string}}}) =>
    `${req.params?.id ?? ''}${req.session?.user?.id ?? ''}`),
  getCaseDataFromStore: jest.fn(),
  saveDraftClaim: jest.fn(),
}));

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockSaveDraftClaim = saveDraftClaim as jest.Mock;

const claimWithDebts = (debts: ReturnType<typeof buildDebtFormYes>): Claim => {
  const claim = new Claim();
  claim.statementOfMeans = new StatementOfMeans();
  claim.statementOfMeans.debts = debts;
  return claim;
};

describe('Debts', () => {
  const getHandler = getRouteHandler(debtsController, 'get');
  const postHandler = getRouteHandler(debtsController, 'post');
  const viewPath = 'features/response/statementOfMeans/debts/debts';
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
    mockGetCaseData.mockResolvedValue(claimWithDebts(buildDebtFormYes()));
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on Exception', () => {
    it('should call next when get throws', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should call next when post throws', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);
      req.body = buildDebtFormYes();

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on GET', () => {
    it('should render the debts page when redis has no debts data', async () => {
      mockGetCaseData.mockResolvedValue(new Claim());

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should render the debts page when redis has data with option yes', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDebts(buildDebtFormYes()));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });

    it('should render the debts page when redis has data with option no', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDebts(buildDebtFormNo()));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
      }));
    });
  });

  describe('on POST', () => {
    it('should validate when has no option selected', async () => {
      req.body = buildDebtFormUndefined();

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().errorFor('option')).toBe('ERRORS.VALID_YES_NO_OPTION');
    });

    it('should validate when option is yes but there is no fields selected', async () => {
      req.body = buildDebtFormYesWithoutItems();

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should validate when option is yes but debt is empty', async () => {
      req.body = buildDebtFormYesWithDebtEmpty();

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should validate when option is yes but total owned is invalid', async () => {
      req.body = buildDebtFormYesWithTotalOwnedInvalid();

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should validate when option is yes but total owned is zero', async () => {
      req.body = buildDebtFormYesWithTotalOwnedZero();

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should validate when option is yes but total owned is empty', async () => {
      req.body = buildDebtFormYesWithTotalOwnedEmpty();

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should redirect when option is no and there is no data on redis', async () => {
      mockGetCaseData.mockResolvedValue(new Claim());
      req.body = buildDebtFormNo();

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_MONTHLY_EXPENSES_URL));
    });

    it('should redirect when option is yes and there is no data on redis', async () => {
      mockGetCaseData.mockResolvedValue(new Claim());
      req.body = buildDebtFormYes();

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_MONTHLY_EXPENSES_URL));
    });

    it('should redirect when option is yes and has data on redis', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDebts(buildDebtFormYes()));
      req.body = buildDebtFormYes();

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_MONTHLY_EXPENSES_URL));
    });

    it('should redirect when option is no and has data on redis', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDebts(buildDebtFormNo()));
      req.body = buildDebtFormNo();

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_MONTHLY_EXPENSES_URL));
    });

    it('should redirect when option is yes but has empty items', async () => {
      mockGetCaseData.mockResolvedValue(claimWithDebts(buildDebtFormNo()));
      req.body = buildDebtFormYesWithEmptyItems();

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_MONTHLY_EXPENSES_URL));
    });

    it('should redirect when option is yes but there is no StatementOfMeans on claim', async () => {
      const claim = new Claim();
      claim.statementOfMeans = undefined;
      mockGetCaseData.mockResolvedValue(claim);
      req.body = buildDebtFormYesWithEmptyItems();

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_MONTHLY_EXPENSES_URL));
    });

    it('should redirect when option is yes but claim has no statement of means', async () => {
      mockGetCaseData.mockResolvedValue(new Claim());
      req.body = buildDebtFormYesWithEmptyItems();

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_MONTHLY_EXPENSES_URL));
    });
  });
});
