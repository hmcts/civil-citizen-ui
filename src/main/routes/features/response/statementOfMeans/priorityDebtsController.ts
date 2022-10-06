import * as express from 'express';
import {CITIZEN_DEBTS_URL, CITIZEN_PRIORITY_DEBTS_URL} from '../../../urls';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {checkBoxFields} from '../../../../common/utils/priorityDebts/priorityDebtsConstants';
import {
  getPriorityDebts,
  savePriorityDebts,
} from '../../../../services/features/response/statementOfMeans/priorityDebtsService';
import {
  convertRequestBodyToForm,
  formatFormErrors,
  listFormErrors,
} from '../../../../common/utils/priorityDebts/priorityDebtsConvertors';

const priorityDebtsController = express.Router();
const debtsViewPath = 'features/response/statementOfMeans/priority-debts';

priorityDebtsController.get(
  CITIZEN_PRIORITY_DEBTS_URL,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      res.render(debtsViewPath, {
        priorityDebts: await getPriorityDebts(req.params.id),
        checkBoxFields,
      });
    } catch (error) {
      next(error);
    }
  },
);

priorityDebtsController.post(
  CITIZEN_PRIORITY_DEBTS_URL,
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const form = convertRequestBodyToForm(req);
      await form.validate();
      if (form.hasErrors()) {
        const priorityDebtErrors = formatFormErrors(form.getErrors());
        const errorList = listFormErrors(priorityDebtErrors);
        res.render(debtsViewPath, {
          priorityDebts: form,
          priorityDebtErrors,
          errors: errorList,
          checkBoxFields,
        });
      } else {
        await savePriorityDebts(req.params.id, form);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEBTS_URL));
      }
    } catch (error) {
      next(error);
    }
  },
);

export default priorityDebtsController;
