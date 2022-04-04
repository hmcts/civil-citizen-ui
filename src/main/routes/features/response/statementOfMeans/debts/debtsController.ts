import * as express from 'express';

import {DEBTS_URL} from '../../../../urls';
import {Debts} from '../../../../../common/form/models/statementOfMeans/debts/debts';
import {validateForm} from '../../../../../common/form/validators/formValidator';
import {DebtItems} from '../../../../../common/form/models/statementOfMeans/debts/debtItems';

const debtsViewPath = 'features/response/statementOfMeans/debts/debts';
const debtsController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('debtsController');


function renderView(form: Debts, res: express.Response): void {
  res.render(debtsViewPath, {form});
}

debtsController.get(DEBTS_URL, async (req, res) => {
  try {
    const form: Debts = new Debts();
    renderView(form, res);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error.message });
  }
});

debtsController.post(DEBTS_URL,
  async (req, res) => {
    try {
      console.log(req.body);
      const items = transformToAccounts(req);
      const form: Debts = new Debts(req.body.option, items);

      await validateForm(form);
      //await validateFormArray(form.debtsItems);
      if (form.hasErrors()) {
        console.log(form.getErrors()[0]);
        renderView(form, res);
      }
    } catch (error) {
      logger.error(error);
      res.status(500).send({ error: error.message });
    }
  });
function transformToAccounts(req: express.Request){
  return req.body.debtsItems.map((account:DebtItems) =>{
    return new DebtItems(account.debt, account.totalOwed, account.monthlyPayments);
  });
}
export default debtsController;
