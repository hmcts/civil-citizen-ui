import {Response, Router} from 'express';
import {
  CITIZEN_BANK_ACCOUNT_URL, CITIZEN_DISABILITY_URL,
} from '../../../../../routes/urls';
import {BankAccounts} from '../../../../../common/form/models/bankAndSavings/bankAccounts';
import {BankAccount} from '../../../../../common/form/models/bankAndSavings/bankAccount';
import {BankAccountTypes} from '../../../../../common/form/models/bankAndSavings/bankAccountTypes';
import {BankAccountService} from '../../../../../services/features/response/statementOfMeans/bankAccounts/bankAccountService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const citizenBankAccountsViewPath = 'features/response/statementOfMeans/citizenBankAndSavings/citizen-bank-accounts';
const bankAccountsController = Router();
const bankAccountService = new BankAccountService();

function renderView(form: GenericForm<BankAccounts>, bankAccountDropDownItems: BankAccountTypes, res: Response): void {
  res.render(citizenBankAccountsViewPath, {form, bankAccountDropDownItems});
}

bankAccountsController.get(CITIZEN_BANK_ACCOUNT_URL, async (req, res) => {
  const bankAccounts = await bankAccountService.getBankAccounts(generateRedisKey(<AppRequest>req));
  renderView(new GenericForm(bankAccounts), new BankAccountTypes(), res);
});

bankAccountsController.post(CITIZEN_BANK_ACCOUNT_URL, async (req, res) => {
  const claimId = req.params.id;
  const bankAccounts = new BankAccounts(req.body.accounts.map((bankAccount: BankAccount) =>
    new BankAccount(bankAccount.typeOfAccount, bankAccount.joint, bankAccount.balance)));
  const form = new GenericForm<BankAccounts>(bankAccounts);
  form.validateSync();

  if (form.hasErrors()) {
    renderView(form, new BankAccountTypes(), res);
  } else {
    await bankAccountService.saveBankAccounts(generateRedisKey(<AppRequest>req), bankAccounts);
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_DISABILITY_URL));
  }
});

export default bankAccountsController;
