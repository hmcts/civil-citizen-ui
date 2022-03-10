import * as express from 'express';
import {CITIZEN_BANK_ACCOUNT_URL, BASE_CASE_RESPONSE_URL} from '../../../../../routes/urls';
import {BankAccounts} from '../../../../../common/form/models/bankAndSavings/bankAccounts';
import {BankAccount} from '../../../../../common/form/models/bankAndSavings/bankAccount';
import { BankAccountTypes } from '../../../../../common/form/models/bankAndSavings/bankAccountTypes';
import {Validator} from 'class-validator';
import {Form} from '../../../../../common/form/models/form';
import {BankAccountService} from '../../../../../modules/statementOfMeans/bankAccounts/bankAccountService';

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
  console.log(req.params.id);
  bankAccountService.getBankAccounts(req.params.id).then((form:BankAccounts)=>{
    renderView(form,  new BankAccountTypes(), res);
  });
});

router.post(BASE_CASE_RESPONSE_URL + CITIZEN_BANK_ACCOUNT_URL,  async(req, res) => {
  const form: BankAccounts = new BankAccounts(transformToAccounts(req));
  await renderErrorsIfExist(form, res, req.params.id);
});

async function renderErrorsIfExist(form: BankAccounts, res: express.Response, claimId:string) {
  await validate(form);
  await validateArray(form.accounts);
  if (form.hasErrors()) {
    renderView(form, new BankAccountTypes(), res);
  } else {
    await bankAccountService.saveBankAccounts(claimId, form);
    renderView(form, new BankAccountTypes(), res);
  }
}

async function validate(form:Form){
  const validator = new Validator();
  const errors = await validator.validate(form);
  form.errors = errors;
}

async function validateArray(forms:BankAccount[]){
  if(forms && forms.length>0){
    for (const form of forms) {
      await validate(form);
    }
  }
}

export default router;
