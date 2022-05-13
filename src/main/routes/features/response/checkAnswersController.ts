import * as express from 'express';
import {RESPONSE_CHECK_ANSWERS_URL} from '../../urls';
import checkAnswersService from '../../../services/features/response/checkAnswersService';
import {SignatureType} from '../../../common/models/signatureType';
import {GenericForm} from '../../../common/form/models/genericForm';
import {StatementOfTruth} from '../../../common/form/models/statementOfTruth/statementOfTruth';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersController');

const checkAnswersViewPath = 'features/response/check-answers';
const checkAnswersController = express.Router();

checkAnswersController.get(RESPONSE_CHECK_ANSWERS_URL, async (req, res) => {
  try {
    const _summarySections = await checkAnswersService.getSummarySections(req.params.id);
    const form = new GenericForm(new StatementOfTruth());
    res.render(checkAnswersViewPath, {
      form: form,
      summarySections: _summarySections,
      signatureType: SignatureType.BASIC,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default checkAnswersController;

