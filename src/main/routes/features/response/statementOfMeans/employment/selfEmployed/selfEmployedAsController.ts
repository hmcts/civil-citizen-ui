import * as express from 'express';
import { ValidationError, Validator } from 'class-validator';
import {SelfEmployedAs} from '../../../../../../common/form/models/statementOfMeans/employment/selfEmployed/selfEmployedAs';
import {constructResponseUrlWithIdParams} from '../../../../../../common/utils/urlFormatter';
import {
  getSelfEmployedAsForm,
  saveSelfEmployedAsData,
} from '../../../../../../modules/statementOfMeans/employment/selfEmployed/selfEmployedAsService';
import {
  SELF_EMPLOYED_AS_URL,
  ON_TAX_PAYMENTS_URL,
} from '../../../../../urls';

const selfEmployedAsViewPath = 'features/response/statementOfMeans/employment/selfEmployed/self-employed-as';
const router = express.Router();

function renderView(form: SelfEmployedAs, res: express.Response): void {
  res.render(selfEmployedAsViewPath, {form});
}

router.get(SELF_EMPLOYED_AS_URL, async (req, res) => {
  try {
    const form = await getSelfEmployedAsForm(req.params.id);
    renderView(form, res);
  } catch (error) {
    res.status(500).send({error: error.message});
  }
});

router.post(SELF_EMPLOYED_AS_URL,
  async (req, res) => {
    try{
      const annualTurnover = req.body.annualTurnover ? Number(req.body.annualTurnover) : undefined;
      const form: SelfEmployedAs = new SelfEmployedAs(req.body.jobTitle, annualTurnover);
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

export default router;
