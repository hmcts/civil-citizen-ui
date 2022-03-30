import * as express from 'express';
import {CHILDREN_DISABILITY_URL, CITIZEN_OTHER_DEPENDANTS_URL} from '../../../../urls';
import {ChildrenDisability} from '../../../../../common/form/models/statementOfMeans/dependants/childrenDisability';
import {
  getChildrenDisability,
  saveChildrenDisability,
} from '../../../../../modules/statementOfMeans/dependants/childrenDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {validateForm} from '../../../../../common/form/validators/formValidator';
import * as winston from 'winston';

const partnerViewPath = 'features/response/statementOfMeans/dependants/children-disability';
const childrenDisabilityController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
let logger = Logger.getLogger('childrenDisabilityController');

export function setChildrenDisabilityControllerLogger(winstonLogger: winston.LoggerInstance) {
  logger = winstonLogger;
}

function renderView(res: express.Response, form: ChildrenDisability): void {
  res.render(partnerViewPath, {form: form});
}

childrenDisabilityController.get(CHILDREN_DISABILITY_URL, async (req: express.Request, res: express.Response) => {
  try {
    const childrenDisability = await getChildrenDisability(req.params.id);
    renderView(res, childrenDisability);
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
    res.status(500).send({errorMessage: error.message, errorStack: error.stack});
  }
});

childrenDisabilityController.post(CHILDREN_DISABILITY_URL, async (req: express.Request, res: express.Response) => {
  const childrenDisability: ChildrenDisability = new ChildrenDisability(req.body.option);
  try {
    await validateForm(childrenDisability);
    if (childrenDisability.hasErrors()) {
      renderView(res, childrenDisability);
    } else {
      await saveChildrenDisability(req.params.id, childrenDisability);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_OTHER_DEPENDANTS_URL));
    }
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
    res.status(500).send({errorMessage: error.message, errorStack: error.stack});
  }
});

export default childrenDisabilityController;
