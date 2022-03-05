import * as express from 'express';
import {CITIZEN_BANK_ACCOUNT_URL} from '../../../../../routes/urls';
import {BankAccounts} from 'common/form/models/bankAndSavings/bankAccounts';
import {BankAccount} from 'common/form/models/bankAndSavings/bankAccount';
import { BankAccountTypes } from 'common/form/models/bankAndSavings/bankAccountTypes';
import {ValidationError, Validator} from 'class-validator';

const citizenBankAccountsViewPath = 'features/response/statementOfMeans/citizenBankAndSavings/citizen-bank-accounts';
const router = express.Router();
function renderView(form: BankAccounts, bankAccountDropDownItems: BankAccountTypes, res: express.Response): void {
  res.render(citizenBankAccountsViewPath, {form: form, bankAccountDropDownItems:bankAccountDropDownItems});
}

router.get(CITIZEN_BANK_ACCOUNT_URL, (req, res) => {
  const form = new BankAccounts([new BankAccount(), new BankAccount()]);
  renderView(form,  new BankAccountTypes(), res);
});

router.post(CITIZEN_BANK_ACCOUNT_URL, (req, res) => {
  console.log(req.body);
  const form: BankAccounts = new BankAccounts(req.body.accounts);
  const validator = new Validator();
  const errors: ValidationError[] = validator.validateSync(form);
  if (errors && errors.length > 0) {
    console.log(errors);
    form.errors = errors;
    renderView(form, new BankAccountTypes(), res);
  }else {
    renderView(form, new BankAccountTypes(), res);
  }
});




export default router;
