import * as express from 'express';

import {DEBTS_URL} from '../../../../urls';
import {Debts} from '../../../../../common/form/models/statementOfMeans/debts/debts';
import {DebtItems} from '../../../../../common/form/models/statementOfMeans/debts/debtItems';
import { validateFormNested} from '../../../../../common/form/validators/formValidator';



const debtsViewPath = 'features/response/statementOfMeans/debts/debts';
const debtsController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('debtsController');

function renderView(form: Debts, res: express.Response): void {
  res.render(debtsViewPath, {
    form,
  });
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
      //const form: GenericForm<Debts> = new GenericForm(new Debts(req.body.option, items));
      //form.errors = validator.validateSync(form.debtsItems[]);


      await validateFormNested(form);

      //await validateFormArray(form.debtsItems);
      //form.errors = validator.validateSync(form);
      //form.getErrors();
      //form.debtsItems[0].errors = validator.validateSync(form.debtsItems[0]);
      //form.debtsItems[0].errors
      if (form.hasErrors()) {
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
