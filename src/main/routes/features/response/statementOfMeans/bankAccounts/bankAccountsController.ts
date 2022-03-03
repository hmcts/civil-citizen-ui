import * as express from 'express';
import {CITIZEN_BANK_ACCOUNT_URL} from '../../../../../routes/urls';
import {ListOfBanksAndSavings} from 'common/form/models/bankAndSavings/listOfBanksAndSavings';
import {BankAccountType} from 'common/form/models/bankAndSavings/bankAccountType';

const citizenBankAccountsViewPath = 'features/response/statementOfMeans/citizenBankAndSavings/citizen-bank-accounts';
const router = express.Router();
function renderView(form: ListOfBanksAndSavings, res: express.Response): void {
  res.render(citizenBankAccountsViewPath, {form: form, bankAccountDropDownItems: BankAccountType.all()});
}

router.get(CITIZEN_BANK_ACCOUNT_URL, (req, res) => {
  const form = new ListOfBanksAndSavings([]);
  renderView(form, res);
});

export default router;
