import * as express from 'express';
import {CitizenTelephoneNumber} from '../../../../common/form/models/citizenTelephoneNumber';
import {CITIZEN_PHONE_NUMBER_URL, CLAIM_TASK_LIST_URL} from '../../../urls';
import {ValidationError, Validator} from 'class-validator';
import { Respondent } from '../../../../common/models/respondent';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {Claim} from '../../../../common/models/claim';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';

const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('citizenPhoneController');
const citizenPhoneViewPath = 'features/response/citizenPhoneNumber/citizen-phone';
const citizenPhoneController = express.Router();
const validator = new Validator();

function renderView(form: CitizenTelephoneNumber, res: express.Response): void {
  res.render(citizenPhoneViewPath, {form: form});
}

citizenPhoneController.get(CITIZEN_PHONE_NUMBER_URL, async (req, res) => {
  try {
    const responseDataRedis: Claim = await getCaseDataFromStore(req.params.id);
    const citizenTelephoneNumber = responseDataRedis?.respondent1?.telephoneNumber
      ? new CitizenTelephoneNumber(responseDataRedis.respondent1.telephoneNumber) : new CitizenTelephoneNumber();
    renderView(citizenTelephoneNumber, res);
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});
citizenPhoneController.post(CITIZEN_PHONE_NUMBER_URL,
  async (req, res) => {
    try {
      const model: CitizenTelephoneNumber = new CitizenTelephoneNumber(req.body.telephoneNumber);
      const errors: ValidationError[] = validator.validateSync(model);
      if (errors?.length > 0) {
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
        const redirectURL = constructResponseUrlWithIdParams(req.params.id, CLAIM_TASK_LIST_URL);
        res.redirect(redirectURL);
      }
    } catch (error) {
      logger.error(error);
      res.status(500).send({error: error.message});
    }
  });

export default citizenPhoneController;
