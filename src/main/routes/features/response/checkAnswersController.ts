import * as express from 'express';
import {RESPONSE_CHECK_ANSWERS_URL} from '../../urls';
import {getSummarySections} from '../../../services/features/response/checkAnswersService';
import {SignatureType} from '../../../common/models/signatureType';
import {GenericForm} from '../../../common/form/models/genericForm';
import {StatementOfTruth} from '../../../common/form/models/statementOfTruth/statementOfTruth';
import {AllResponseTasksCompletedGuard} from '../../../routes/features/response/guards/allResponseTasksCompletedGuard';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersController');

const checkAnswersViewPath = 'features/response/check-answers';
const checkAnswersController = express.Router();

checkAnswersController.get(RESPONSE_CHECK_ANSWERS_URL,
  AllResponseTasksCompletedGuard.apply,
  async (req: express.Request, res: express.Response) => {
    try {
      const _summarySections = await getSummarySections(req.params.id);
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

