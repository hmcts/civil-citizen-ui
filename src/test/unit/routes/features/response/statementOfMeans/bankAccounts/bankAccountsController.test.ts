import {Request, Response} from 'express';
import bankAccountsController from '../../../../../../../main/routes/features/response/statementOfMeans/bankAccounts/bankAccountsController';
import {CITIZEN_DISABILITY_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {BankAccounts} from 'form/models/bankAndSavings/bankAccounts';
import {BankAccount} from 'form/models/bankAndSavings/bankAccount';
import {BankAccountService} from 'services/features/response/statementOfMeans/bankAccounts/bankAccountService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Bank Accounts and Savings', () => {
  const getHandler = getRouteHandler(bankAccountsController, 'get');
  const postHandler = getRouteHandler(bankAccountsController, 'post');
  const viewPath = 'features/response/statementOfMeans/citizenBankAndSavings/citizen-bank-accounts';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let mockGetBankAccounts: jest.SpyInstance;
  let mockSaveBankAccounts: jest.SpyInstance;

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    mockGetBankAccounts = jest.spyOn(BankAccountService.prototype, 'getBankAccounts')
      .mockResolvedValue(new BankAccounts([new BankAccount(), new BankAccount()]));
    mockSaveBankAccounts = jest.spyOn(BankAccountService.prototype, 'saveBankAccounts')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should render the bank accounts page', async () => {
      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect(mockGetBankAccounts).toHaveBeenCalled();
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
      expect(mockSaveBankAccounts).not.toHaveBeenCalled();
    });

    it('should save and redirect when the account is valid', async () => {
      req.body = {
        accounts: [
          {typeOfAccount: 'CURRENT_ACCOUNT', joint: 'No', balance: '456.90'},
          {typeOfAccount: '', joint: '', balance: ''},
        ],
      };

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveBankAccounts).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DISABILITY_URL));
      expect(next).not.toHaveBeenCalled();
    });
  });
});
