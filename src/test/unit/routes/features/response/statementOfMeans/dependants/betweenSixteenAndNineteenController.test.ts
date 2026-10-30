import {Request, Response} from 'express';
import betweenSixteenAndNineteenController from '../../../../../../../main/routes/features/response/statementOfMeans/dependants/betweenSixteenAndNineteenController';
import {CHILDREN_DISABILITY_URL, CITIZEN_OTHER_DEPENDANTS_URL} from 'routes/urls';
import {Dependants} from 'form/models/statementOfMeans/dependants/dependants';
import {NumberOfChildren} from 'form/models/statementOfMeans/dependants/numberOfChildren';
import {BetweenSixteenAndNineteenDependants} from 'form/models/statementOfMeans/dependants/betweenSixteenAndNineteenDependants';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as betweenSixteenAndNineteenService from 'services/features/response/statementOfMeans/dependants/betweenSixteenAndNineteenService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Dependant Teenagers', () => {
  const getHandler = getRouteHandler(betweenSixteenAndNineteenController, 'get');
  const postHandler = getRouteHandler(betweenSixteenAndNineteenController, 'post');
  const viewPath = 'features/response/statementOfMeans/dependants/between_16_and_19';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let mockGetForm: jest.SpyInstance;
  let mockSaveFormToDraftStore: jest.SpyInstance;

  const claimWhereChildrenMayBeDisabled = (): Claim => {
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.disability = new GenericYesNo(YesNo.NO);
    claim.statementOfMeans.dependants = new Dependants(true, new NumberOfChildren(1));
    return claim;
  };

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetForm = jest.spyOn(betweenSixteenAndNineteenService, 'getForm')
      .mockResolvedValue(new GenericForm(new BetweenSixteenAndNineteenDependants(undefined, 3)));
    mockSaveFormToDraftStore = jest.spyOn(betweenSixteenAndNineteenService, 'saveFormToDraftStore')
      .mockResolvedValue(new Claim());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should render the dependant teenagers page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect(mockGetForm).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetForm.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no number is entered', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveFormToDraftStore).not.toHaveBeenCalled();
    });

    it('should re-render when the number is negative', async () => {
      req.body = {value: -1, maxValue: 3};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when the number is a decimal', async () => {
      req.body = {value: 1.3, maxValue: 3};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when the number is greater than the maximum', async () => {
      req.body = {value: 4, maxValue: 3};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect to other dependants when children are not treated as disabled', async () => {
      req.body = {value: 1, maxValue: 3};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveFormToDraftStore).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_OTHER_DEPENDANTS_URL));
    });

    it('should redirect to children disability when children are treated as disabled', async () => {
      mockSaveFormToDraftStore.mockResolvedValue(claimWhereChildrenMayBeDisabled());
      req.body = {value: 1, maxValue: 3};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CHILDREN_DISABILITY_URL));
    });

    it('should call next when saving fails', async () => {
      const error = new Error('draft failure');
      mockSaveFormToDraftStore.mockRejectedValue(error);
      req.body = {value: 1, maxValue: 3};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
