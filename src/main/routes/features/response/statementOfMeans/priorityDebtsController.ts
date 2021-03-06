import * as express from 'express';
import {validateForm} from '../../../../common/form/validators/formValidator';
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
      const savedValues = await getPriorityDebts(req.params.id);
      res.render(debtsViewPath, {
        priorityDebts: savedValues,
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
    const convertedDebtValues = convertRequestBodyToForm(req);

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
      next(error);
    }
  },
);

export default priorityDebtsController;
