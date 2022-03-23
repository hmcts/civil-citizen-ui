import * as express from 'express';
import {DEPENDANT_TEENAGERS_URL, OTHER_DEPENDANTS_URL} from '../../../../../routes/urls';
import {DependantTeenagers} from '../../../../../common/form/models/statementOfMeans/dependants/dependantTeenagers';
import {validateForm} from '../../../../../common/form/validators/formValidator';
import {saveFormToDraftStore} from '../../../../../modules/statementOfMeans/dependants/dependantTeenagersService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';


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
      await saveFormToDraftStore(req.params.id, form);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, OTHER_DEPENDANTS_URL));
    }
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
    res.status(500).send({error: error.message});
  }
});
export default router;
