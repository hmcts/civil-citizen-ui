import * as express from 'express';
import {CITIZEN_BANK_ACCOUNT_URL} from '../../../../../routes/urls';
import {ListOfBanksAndSavings} from 'common/form/models/bankAndSavings/listOfBanksAndSavings';
import {BankAccount} from 'common/form/models/bankAndSavings/bankAccount';
import { BankAccountTypes } from 'common/form/models/bankAndSavings/bankAccountTypes';

const citizenBankAccountsViewPath = 'features/response/statementOfMeans/citizenBankAndSavings/citizen-bank-accounts';
const router = express.Router();
function renderView(form: ListOfBanksAndSavings, bankAccountDropDownItems: BankAccountTypes, res: express.Response): void {
  res.render(citizenBankAccountsViewPath, {form: form, bankAccountDropDownItems:bankAccountDropDownItems});
}

function convertToFormModel(req: express.Request){
  const rows = req.body.rows;
  const accounts:BankAccount[] = Object.values(rows);
  return new ListOfBanksAndSavings(accounts);
}

router.get(CITIZEN_BANK_ACCOUNT_URL, (req, res) => {
  const form = new ListOfBanksAndSavings([new BankAccount(), new BankAccount()]);
  renderView(form,  new BankAccountTypes(), res);
});

router.post(CITIZEN_BANK_ACCOUNT_URL, (req, res) => {
  const form: ListOfBanksAndSavings = convertToFormModel(req);

  console.log(form);
  renderView(form, new BankAccountTypes(), res);
});




export default router;
