import * as express from 'express';
import {PARTNER_AGE_URL, PARTNER_DEPENDANTS_URL, PARTNER_URL} from '../../../../urls';
import {Cohabiting} from '../../../../../common/form/models/statementOfMeans/partner/cohabiting';
import {ValidationError, Validator} from 'class-validator';
import {CohabitingService} from '../../../../../modules/statementOfMeans/partner/cohabitingService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const partnerViewPath = 'features/response/statement-of-means/partner/partner';
const router = express.Router();
const cohabiting = new Cohabiting();
const cohabitingService = new CohabitingService();

function renderView(form: Cohabiting, res: express.Response): void {
  res.render(partnerViewPath, {form});
}

router.get(PARTNER_URL.toString(), async (req, res) => {
  cohabitingService.getCohabiting(req.params.id).then(() => {
    renderView(cohabiting, res);
  });
});

router.post(PARTNER_URL.toString(),
  (req, res) => {
    const cohabiting: Cohabiting = new Cohabiting(req.body.cohabiting);
    const validator = new Validator();
    const errors: ValidationError[] = validator.validateSync(cohabiting);
    if (errors && errors.length > 0) {
      cohabiting.errors = errors;
      renderView(cohabiting, res);
    } else {
      cohabitingService.saveCohabiting(req.params.id, cohabiting);
      if (cohabiting.option == 'yes') {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, PARTNER_AGE_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(req.params.id, PARTNER_DEPENDANTS_URL));
      }
    }
  });

export default router;
