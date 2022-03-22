import * as express from 'express';
import {DEPENDANT_TEENAGERS_URL} from '../../../../../routes/urls';
import {DependantTeenagers} from '../../../../../common/form/models/statementOfMeans/dependants/dependantTeenagers';
import {validateForm} from '../../../../../common/form/validators/formValidator';


const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dependantTeenagersController');
const dependantTeenagersViewPath = 'features/response/statementOfMeans/dependants/dependant-teenagers';
const router = express.Router();

function renderView(form: DependantTeenagers, res: express.Response): void {
  res.render(dependantTeenagersViewPath, {form: form});
}

router.get(DEPENDANT_TEENAGERS_URL, (req, res) => {
  const form = new DependantTeenagers(undefined, 3);
  renderView(form, res);
});

router.post(DEPENDANT_TEENAGERS_URL, async (req, res) => {
  console.log(req.body.value);
  console.log(req.body.maxValue);
  const form = new DependantTeenagers(req.body.value, req.body.maxValue);
  try {
    await validateForm(form);
    if (form.hasErrors()) {
      renderView(form, res);
    }
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
    res.status(500).send({error: error.message});
  }
});
export default router;
