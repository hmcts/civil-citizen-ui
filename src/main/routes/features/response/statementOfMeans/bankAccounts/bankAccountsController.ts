import * as express from 'express';
import {
  CITIZEN_BANK_ACCOUNT_URL,
  BASE_CASE_RESPONSE_URL,
  CITIZEN_SEVERELY_DISABLED_URL,
} from '../../../../../routes/urls';
import {BankAccounts} from '../../../../../common/form/models/bankAndSavings/bankAccounts';
import {BankAccount} from '../../../../../common/form/models/bankAndSavings/bankAccount';
import { BankAccountTypes } from '../../../../../common/form/models/bankAndSavings/bankAccountTypes';
import {BankAccountService} from '../../../../../modules/statementOfMeans/bankAccounts/bankAccountService';
import {validateForm, validateFormArray} from '../../../../../common/form/validators/formValidator';
import { constructResponseUrlWithIdParams } from '../../../../../common/utils/urlFormatter';

const citizenBankAccountsViewPath = 'features/response/statementOfMeans/citizenBankAndSavings/citizen-bank-accounts';
const router = express.Router();
const bankAccountService = new BankAccountService();

function renderView(form: BankAccounts, bankAccountDropDownItems: BankAccountTypes,  res: express.Response): void {
  res.render(citizenBankAccountsViewPath, {form: form, bankAccountDropDownItems:bankAccountDropDownItems});
}

function transformToAccounts(req: express.Request){
  return req.body.accounts.map((account:BankAccount) =>{
    return new BankAccount(account.typeOfAccount, account.joint, account.balance);
  });
}

router.get( BASE_CASE_RESPONSE_URL + CITIZEN_BANK_ACCOUNT_URL, (req, res) => {
  bankAccountService.getBankAccounts(req.params.id).then((form:BankAccounts)=>{
    renderView(form,  new BankAccountTypes(), res);
  });
});

router.post(BASE_CASE_RESPONSE_URL + CITIZEN_BANK_ACCOUNT_URL,  async(req, res) => {
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
    res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_SEVERELY_DISABLED_URL));
  }
}

export default router;
