import * as express from 'express';
import {DEPENDANT_TEENAGERS_URL} from '../../../../../routes/urls';
import {DependantTeenagers} from '../../../../../common/form/models/statementOfMeans/dependants/dependantTeenagers';
import {validateForm} from '../../../../../common/form/validators/formValidator';
import {saveToDraftStore} from 'modules/statementOfMeans/dependants/dependantTeenagersService';


const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dependantTeenagersController');
const dependantTeenagersViewPath = 'features/response/statementOfMeans/dependants/dependant-teenagers';
const router = express.Router();

function renderView(form: DependantTeenagers, res: express.Response): void {
  res.render(dependantTeenagersViewPath, {form: form});
}

function convertToForm(req: express.Request) {
  const value = req.body.value ? Number(req.body.value) : undefined;
  const maxValue = req.body.maxValue ? Number(req.body.maxValue) : undefined;
  return new DependantTeenagers(value, maxValue);
}

router.get(DEPENDANT_TEENAGERS_URL, (req, res) => {
  const form = new DependantTeenagers(undefined, 3);
  renderView(form, res);
});

router.post(DEPENDANT_TEENAGERS_URL, async (req, res) => {
  const form = convertToForm(req);
  try {
    await validateForm(form);
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveToDraftStore(req.params.id, form);
    }
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
    res.status(500).send({error: error.message});
  }
});
export default router;
