import * as express from 'express';
import {CITIZEN_BANK_ACCOUNT_URL} from '../../../../../routes/urls';
import {ListOfBanksAndSavings} from 'common/form/models/bankAndSavings/listOfBanksAndSavings';
import {BankAccountType} from 'common/form/models/bankAndSavings/bankAccountType';
import {BankAccount} from 'common/form/models/bankAndSavings/bankAccount';

const citizenBankAccountsViewPath = 'features/response/statementOfMeans/citizenBankAndSavings/citizen-bank-accounts';
const router = express.Router();
function renderView(form: ListOfBanksAndSavings, res: express.Response): void {
  res.render(citizenBankAccountsViewPath, {form: form, bankAccountDropDownItems: BankAccountType.all()});
}

function convertToFormModel(req: express.Request){
  const rows = req.body.rows;
  const accounts:BankAccount[] = Object.values(rows);
  return new ListOfBanksAndSavings(accounts);
}

router.get(CITIZEN_BANK_ACCOUNT_URL, (req, res) => {
  const form = new ListOfBanksAndSavings([new BankAccount(), new BankAccount()]);
  renderView(form, res);
});
router.post(CITIZEN_BANK_ACCOUNT_URL, (req, res) => {
  const form: ListOfBanksAndSavings = convertToFormModel(req);
  renderView(form, res);
});




export default router;
