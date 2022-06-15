import * as express from 'express';
import { ValidationError, Validator } from 'class-validator';
import {SelfEmployedAsForm} from '../../../../../../common/form/models/statementOfMeans/employment/selfEmployed/selfEmployedAsForm';
import {constructResponseUrlWithIdParams} from '../../../../../../common/utils/urlFormatter';
import {
  getSelfEmployedAsForm,
  saveSelfEmployedAsData,
} from '../../../../../../services/features/response/statementOfMeans/employment/selfEmployed/selfEmployedAsService';
import {
  CITIZEN_SELF_EMPLOYED_URL,
  ON_TAX_PAYMENTS_URL,
} from '../../../../../urls';

const selfEmployedAsViewPath = 'features/response/statementOfMeans/employment/selfEmployed/self-employed-as';
const selfEmployedAsController = express.Router();

function renderView(form: SelfEmployedAsForm, res: express.Response): void {
  res.render(selfEmployedAsViewPath, {form});
}

selfEmployedAsController.get(CITIZEN_SELF_EMPLOYED_URL, async (req, res) => {
  try {
    const form = await getSelfEmployedAsForm(req.params.id);
    renderView(form, res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

selfEmployedAsController.post(CITIZEN_SELF_EMPLOYED_URL,
  async (req, res) => {
    try{
      const annualTurnover = req.body.annualTurnover ? Number(req.body.annualTurnover) : undefined;
      const form: SelfEmployedAsForm = new SelfEmployedAsForm(req.body.jobTitle, annualTurnover);
      const validator = new Validator();
      const errors: ValidationError[] = validator.validateSync(form);
      if (errors && errors.length > 0) {
        form.errors = errors;
        renderView(form, res);
      } else {
        await saveSelfEmployedAsData(req.params.id, form);
        res.redirect(constructResponseUrlWithIdParams(req.params.id, ON_TAX_PAYMENTS_URL));
      }
    } catch (error) {
      res.status(500).send({error: error.message});
    }
  });

export default selfEmployedAsController;
