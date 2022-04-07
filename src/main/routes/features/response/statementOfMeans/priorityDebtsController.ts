import * as express from 'express';
import {validateForm} from '../../../../common/form/validators/formValidator';
import {CITIZEN_DEBTS_URL, CITIZEN_PRIORITY_DEBTS_URL} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {checkBoxFields} from '../../../../../main/common/utils/priorityDebtsConstants';
import {
  getPriorityDebts,
  savePriorityDebts,
  convertRequestBodyToForm,
  formatFormErrors,
  listFormErrors,
} from '../../../../modules/statementOfMeans/priorityDebtsService';
const priorityDebtsRrouter = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('debtsController');

const debtsViewPath = 'features/response/statementOfMeans/priority-debts';

priorityDebtsRrouter.get(
  CITIZEN_PRIORITY_DEBTS_URL,
  async (req: express.Request, res: express.Response) => {
    try {
      const savedValues = await getPriorityDebts(req.params.id);
      res.render(debtsViewPath, {
        priorityDebts: savedValues,
        checkBoxFields,
      });
    } catch (error) {
      logger.error(`${(error as Error).stack || error}`);
      res.status(500).send({error: error.message});
    }
  },
);

priorityDebtsRrouter.post(
  CITIZEN_PRIORITY_DEBTS_URL,
  async (req: express.Request, res: express.Response) => {
    const convertedDebtValues = convertRequestBodyToForm(req.body);
    
    try {
      await validateForm(convertedDebtValues);

      if (convertedDebtValues.hasErrors()) {
        const priorityDebtErrors = formatFormErrors(convertedDebtValues.errors);
        const errorList = listFormErrors(priorityDebtErrors);
        res.render(debtsViewPath, {
          priorityDebts: convertedDebtValues,
          priorityDebtErrors,
          errors: errorList,
          checkBoxFields,
        });
      } else {
        await savePriorityDebts(req.params.id, convertedDebtValues);
        res.redirect(
          constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEBTS_URL),
        );
      }
    } catch (error) {
      logger.error(`${(error as Error).stack || error}`);
      res.status(500).send({error: error.message});
    }
  },
);

export default priorityDebtsRrouter;
