import * as express from 'express';

import {DEBTS_URL} from '../../../../urls';
import {Debts} from '../../../../../common/form/models/statementOfMeans/debts/debts';
import {validateForm, validateFormArray} from "common/form/validators/formValidator";

const debtsViewPath = 'features/response/statementOfMeans/debts/debts';
const debtsController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('disabilityController');


function renderView(form: Debts, res: express.Response): void {
  res.render(debtsViewPath,  form);
}

debtsController.get(DEBTS_URL, async (req, res) => {
  try {
    renderView(new Debts(true), res);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error.message });
  }
});

debtsController.post(DEBTS_URL,
  async (req, res) => {
    try {
      console.log(req.body);
      await validateForm(new Debts(true));
      await validateFormArray(form.accounts);
    } catch (error) {
      logger.error(error);
      res.status(500).send({ error: error.message });
    }
  });

export default debtsController;
