import * as express from 'express';
import {
  CITIZEN_BANK_ACCOUNT_URL, CITIZEN_DISABILITY_URL,
} from '../../../../../routes/urls';
import {BankAccounts} from '../../../../../common/form/models/bankAndSavings/bankAccounts';
import {BankAccount} from '../../../../../common/form/models/bankAndSavings/bankAccount';
import { BankAccountTypes } from '../../../../../common/form/models/bankAndSavings/bankAccountTypes';
import {BankAccountService} from '../../../../../services/features/response/statementOfMeans/bankAccounts/bankAccountService';
import {validateForm, validateFormArray} from '../../../../../common/form/validators/formValidator';
import { constructResponseUrlWithIdParams } from '../../../../../common/utils/urlFormatter';

const citizenBankAccountsViewPath = 'features/response/statementOfMeans/citizenBankAndSavings/citizen-bank-accounts';
const bankAccountsController = express.Router();
const bankAccountService = new BankAccountService();

function renderView(form: BankAccounts, bankAccountDropDownItems: BankAccountTypes,  res: express.Response): void {
  res.render(citizenBankAccountsViewPath, {form: form, bankAccountDropDownItems:bankAccountDropDownItems});
}

function transformToAccounts(req: express.Request){
  return req.body.accounts.map((account:BankAccount) =>{
    return new BankAccount(account.typeOfAccount, account.joint, account.balance);
  });
}

bankAccountsController.get(CITIZEN_BANK_ACCOUNT_URL, (req, res) => {
  bankAccountService.getBankAccounts(req.params.id).then((form:BankAccounts)=>{
    renderView(form,  new BankAccountTypes(), res);
  });
});

bankAccountsController.post(CITIZEN_BANK_ACCOUNT_URL,  async(req, res) => {
  const form: BankAccounts = new BankAccounts(transformToAccounts(req));
  await renderErrorsIfExist(form, res, req.params.id);
});

async function renderErrorsIfExist(form: BankAccounts, res: express.Response, claimId:string) {
  await validateForm(form);
  await validateFormArray(form.accounts);
  if (form.hasErrors()) {
    renderView(form, new BankAccountTypes(), res);
  } else {
    await bankAccountService.saveBankAccounts(claimId, form);
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_DISABILITY_URL));
  }
}

export default bankAccountsController;
