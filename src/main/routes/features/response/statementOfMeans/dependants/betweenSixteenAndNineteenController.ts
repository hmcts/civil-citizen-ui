import * as express from 'express';
import {CITIZEN_DEPENDANTS_EDUCATION_URL, CITIZEN_OTHER_DEPENDANTS_URL} from '../../../../../routes/urls';
import {
  BetweenSixteenAndNineteenDependants,
} from '../../../../../common/form/models/statementOfMeans/dependants/betweenSixteenAndNineteenDependants';
import {validateForm} from '../../../../../common/form/validators/formValidator';
import {
  getForm,
  saveFormToDraftStore,
} from '../../../../../modules/statementOfMeans/dependants/betweenSixteenAndNineteenService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';


const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dependantTeenagersController');
const dependantTeenagersViewPath = 'features/response/statementOfMeans/dependants/between_16_and_19';
const router = express.Router();

function renderView(form: BetweenSixteenAndNineteenDependants, res: express.Response): void {
  res.render(dependantTeenagersViewPath, {form: form});
}

function convertToForm(req: express.Request) {
  const value = req.body.value ? Number(req.body.value) : undefined;
  const maxValue = req.body.maxValue ? Number(req.body.maxValue) : undefined;
  return new BetweenSixteenAndNineteenDependants(value, maxValue);
}

router.get(CITIZEN_DEPENDANTS_EDUCATION_URL, async (req, res) => {
  try {
    const form = await getForm(req.params.id);
    renderView(form, res);
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
    res.status(500).send({error: error.message});
  }
});

router.post(CITIZEN_DEPENDANTS_EDUCATION_URL, async (req, res) => {
  const form = convertToForm(req);
  try {
    await validateForm(form);
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveFormToDraftStore(req.params.id, form);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_OTHER_DEPENDANTS_URL));
    }
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
    res.status(500).send({error: error.message});
  }
});
export default router;
