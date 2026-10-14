import {Request, Response} from 'express';
import otherDependantsController from '../../../../../../../main/routes/features/response/statementOfMeans/otherDependants/otherDependantsController';
import {CITIZEN_CARER_URL, CITIZEN_EMPLOYMENT_URL} from 'routes/urls';
import {Dependants} from 'form/models/statementOfMeans/dependants/dependants';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Other Dependants', () => {
  const getHandler = getRouteHandler(otherDependantsController, 'get');
  const postHandler = getRouteHandler(otherDependantsController, 'post');
  const viewPath = 'features/response/statementOfMeans/otherDependants/other-dependants';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGetDraftClaim = draftStoreService.getDraftClaimFromStore as jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const claimWith = (configure: (statementOfMeans: StatementOfMeans) => void): Claim => {
    const claim = new Claim();
    claim.statementOfMeans = new StatementOfMeans();
    configure(claim.statementOfMeans);
    return claim;
  };

  const severelyDisabledDefendant = (): Claim => claimWith((statementOfMeans) => {
    statementOfMeans.disability = new GenericYesNo(YesNo.YES);
    statementOfMeans.severeDisability = new GenericYesNo(YesNo.YES);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(new Claim());
    mockGetDraftClaim.mockResolvedValue({});
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the other dependants page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetDraftClaim.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no option is selected', async () => {
      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.anything()}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should redirect to employment when the defendant is severely disabled', async () => {
      mockGetCaseData.mockResolvedValue(severelyDisabledDefendant());
      req.body = {option: 'no', numberOfPeople: '', details: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_EMPLOYMENT_URL));
    });

    it('should redirect to employment when the partner is disabled', async () => {
      mockGetCaseData.mockResolvedValue(claimWith((statementOfMeans) => {
        statementOfMeans.cohabiting = new GenericYesNo(YesNo.YES);
        statementOfMeans.partnerDisability = new GenericYesNo(YesNo.YES);
      }));
      req.body = {option: 'no', numberOfPeople: '', details: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_EMPLOYMENT_URL));
    });

    it('should redirect to employment when a child is disabled', async () => {
      mockGetCaseData.mockResolvedValue(claimWith((statementOfMeans) => {
        statementOfMeans.dependants = new Dependants(true);
        statementOfMeans.childrenDisability = new GenericYesNo(YesNo.YES);
      }));
      req.body = {option: 'no', numberOfPeople: '', details: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_EMPLOYMENT_URL));
    });

    it('should redirect to employment when yes is selected with valid details and the defendant is severely disabled', async () => {
      mockGetCaseData.mockResolvedValue(severelyDisabledDefendant());
      req.body = {option: 'yes', numberOfPeople: '1', details: 'Test details'};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_EMPLOYMENT_URL));
    });

    it('should redirect to carer when disability, cohabiting and children disability are no', async () => {
      mockGetCaseData.mockResolvedValue(claimWith((statementOfMeans) => {
        statementOfMeans.disability = new GenericYesNo(YesNo.NO);
        statementOfMeans.cohabiting = new GenericYesNo(YesNo.NO);
        statementOfMeans.childrenDisability = new GenericYesNo(YesNo.NO);
      }));
      req.body = {option: 'no', numberOfPeople: '', details: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_CARER_URL));
    });

    it('should redirect to carer when the defendant is disabled but the partner is not', async () => {
      mockGetCaseData.mockResolvedValue(claimWith((statementOfMeans) => {
        statementOfMeans.disability = new GenericYesNo(YesNo.YES);
        statementOfMeans.cohabiting = new GenericYesNo(YesNo.YES);
        statementOfMeans.partnerDisability = new GenericYesNo(YesNo.NO);
      }));
      req.body = {option: 'no', numberOfPeople: '', details: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_CARER_URL));
    });

    it('should re-render when yes is selected and the number of people is empty', async () => {
      req.body = {option: 'yes', numberOfPeople: '', details: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when the number of people is negative', async () => {
      req.body = {option: 'yes', numberOfPeople: '-1', details: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when the number of people is valid and details are empty', async () => {
      req.body = {option: 'yes', numberOfPeople: '1', details: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should re-render when the number of people is zero and details are empty', async () => {
      req.body = {option: 'yes', numberOfPeople: '0', details: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);
      req.body = {option: 'no', numberOfPeople: '', details: ''};

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
