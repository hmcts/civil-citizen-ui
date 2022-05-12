import * as express from 'express';
import {RESPONSE_CHECK_ANSWERS_URL} from '../../urls';
import checkAnswersService from '../../../services/features/response/checkAnswersService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersController');

const checkAnswersViewPath = 'features/response/check-answers';
const checkAnswersController = express.Router();

checkAnswersController.get(RESPONSE_CHECK_ANSWERS_URL, async (req, res) => {
  try {
    const getSummaryListAggregate = await checkAnswersService.getSummaryListAggregate(req.params.id);
    res.render(checkAnswersViewPath, {
      summaryListAggregate: getSummaryListAggregate,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({error: error.message});
  }
});

export default checkAnswersController;

