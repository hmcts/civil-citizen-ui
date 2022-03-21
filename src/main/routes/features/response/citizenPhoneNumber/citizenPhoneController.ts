import * as express from 'express';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {CITIZEN_PHONE_NUMBER_URL, DASHBOARD_URL} from '../../../urls';
import {ValidationError, Validator} from 'class-validator';
import {Respondent} from '../../../../common/models/respondent';
import {Claim} from '../../../../common/models/claim';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('citizenPhoneController');
const citizenPhoneViewPath = 'features/response/citizenPhoneNumber/citizen-phone';
const router = express.Router();

function renderView(form: CitizenTelephoneNumber, res: express.Response): void {
  res.render(citizenPhoneViewPath, {form: form});
}

router.get(CITIZEN_PHONE_NUMBER_URL.toString(), async (req, res) => {
  try {
    const responseDataRedis: Claim = await getCaseDataFromStore(req.params.id);
    const citizenTelephoneNumber = !(responseDataRedis && responseDataRedis.respondent1.telephoneNumber) ? new CitizenTelephoneNumber() : new CitizenTelephoneNumber(responseDataRedis.respondent1.telephoneNumber);
    renderView(citizenTelephoneNumber, res);
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});
router.post(CITIZEN_PHONE_NUMBER_URL.toString(),
  async (req, res) => {
    try {
      const model: CitizenTelephoneNumber = new CitizenTelephoneNumber(req.body.telephoneNumber);
      const validator = new Validator();
      const errors: ValidationError[] = validator.validateSync(model);
      if (errors && errors.length > 0) {
        model.errors = errors;
        renderView(model, res);
      } else {
        const claim = await getCaseDataFromStore(req.params.id) || new Claim();
        if (claim.respondent1) {
          claim.respondent1.telephoneNumber = model.telephoneNumber;
        } else {
          const respondent = new Respondent();
          respondent.telephoneNumber = model.telephoneNumber;
          claim.respondent1 = respondent;
        }
        await saveDraftClaim(req.params.id, claim);
        res.redirect(DASHBOARD_URL);
      }
    } catch (error) {
      logger.error(error);
      res.status(500).send({error: error.message});
    }
  });

export default router;
