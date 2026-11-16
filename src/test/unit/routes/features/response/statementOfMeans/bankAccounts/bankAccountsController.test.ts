import {Request, Response} from 'express';
import bankAccountsController from '../../../../../../../main/routes/features/response/statementOfMeans/bankAccounts/bankAccountsController';
import {CITIZEN_DISABILITY_URL} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

describe('Bank Accounts and Savings', () => {
  const getHandler = getRouteHandler(bankAccountsController, 'get');
  const postHandler = getRouteHandler(bankAccountsController, 'post');
  const viewPath = 'features/response/statementOfMeans/citizenBankAndSavings/citizen-bank-accounts';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGenerateRedisKey = draftStoreService.generateRedisKey as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(claimId);
    mockGetCaseData.mockResolvedValue(new Claim());
    mockSaveDraftClaim.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the bank accounts page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('on POST', () => {
    it('should re-render when the account type is missing', async () => {
      req.body = {
        accounts: [
          {typeOfAccount: '', joint: 'true', balance: '-234.33'},
          {typeOfAccount: '', joint: '', balance: ''},
        ],
      };

      await postHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should save and redirect when the account is valid', async () => {
      req.body = {
        accounts: [
          {typeOfAccount: 'CURRENT_ACCOUNT', joint: 'No', balance: '456.90'},
          {typeOfAccount: '', joint: '', balance: ''},
        ],
      };

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DISABILITY_URL));
      expect(next).not.toHaveBeenCalled();
    });
  });
});
