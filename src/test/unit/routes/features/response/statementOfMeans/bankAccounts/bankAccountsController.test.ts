import {Response} from 'express';
import bankAccountsController from '../../../../../../../main/routes/features/response/statementOfMeans/bankAccounts/bankAccountsController';
import {CITIZEN_DISABILITY_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {BankAccounts} from 'form/models/bankAndSavings/bankAccounts';
import {BankAccount} from 'form/models/bankAndSavings/bankAccount';
import {BankAccountService} from 'services/features/response/statementOfMeans/bankAccounts/bankAccountService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

describe('Bank Accounts and Savings', () => {
  const getHandler = getRouteHandler(bankAccountsController, 'get');
  const postHandler = getRouteHandler(bankAccountsController, 'post');
  const viewPath = 'features/response/statementOfMeans/citizenBankAndSavings/citizen-bank-accounts';
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
    jest.spyOn(BankAccountService.prototype, 'getBankAccounts').mockResolvedValue(new BankAccounts([new BankAccount(), new BankAccount()]));
    jest.spyOn(BankAccountService.prototype, 'saveBankAccounts').mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render accounts page successfully', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.any(GenericForm),
        bankAccountDropDownItems: expect.anything(),
      }));
    });
  });

  describe('on POST', () => {
    it('should re-render when type of account is not specified', async () => {
      req.body = {
        accounts: [
          {typeOfAccount: '', joint: 'true', balance: '-234.33'},
          {typeOfAccount: '', joint: '', balance: ''},
        ],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should re-render when joint is not specified', async () => {
      req.body = {
        accounts: [
          {typeOfAccount: 'CURRENT_ACCOUNT', joint: '', balance: '-234.33'},
          {typeOfAccount: '', joint: '', balance: ''},
        ],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should re-render when balance is not specified', async () => {
      req.body = {
        accounts: [
          {typeOfAccount: 'CURRENT_ACCOUNT', joint: 'No', balance: ''},
          {typeOfAccount: '', joint: '', balance: ''},
        ],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should re-render when balance has more than two decimal places', async () => {
      req.body = {
        accounts: [
          {typeOfAccount: 'CURRENT_ACCOUNT', joint: 'No', balance: '456.9090'},
          {typeOfAccount: '', joint: '', balance: ''},
        ],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should re-render when balance for input is 00', async () => {
      req.body = {
        accounts: [
          {typeOfAccount: 'CURRENT_ACCOUNT', joint: 'No', balance: '00.0'},
          {typeOfAccount: '', joint: '', balance: ''},
        ],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect(renderedForm().hasErrors() || renderedForm().hasNestedErrors()).toBe(true);
    });

    it('should redirect when no validation errors', async () => {
      req.body = {
        accounts: [
          {typeOfAccount: 'CURRENT_ACCOUNT', joint: 'No', balance: '456.90'},
          {typeOfAccount: '', joint: '', balance: ''},
        ],
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(BankAccountService.prototype.saveBankAccounts).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_DISABILITY_URL));
    });
  });
});
