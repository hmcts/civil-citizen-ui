import * as express from 'express';
import {
  CHILDREN_DISABILITY_URL,
  CITIZEN_OTHER_DEPENDANTS_URL,
} from '../../../../urls';
import {
  ChildrenDisability,
} from 'common/form/models/statementOfMeans/dependants/childrenDisability';
import {ValidationError, Validator} from 'class-validator';
import {
  ChildrenDisabilityService,
} from 'modules/statementOfMeans/dependants/childrenDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const partnerViewPath = 'features/response/statementOfMeans/dependants/children-disability';
const router = express.Router();
const childrenLiveWithYouDisabilityService = new ChildrenDisabilityService();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('childrenLiveWithYouDisabilityService');
const validator = new Validator();

function renderView(res: express.Response, form: ChildrenDisability): void {
  res.render(partnerViewPath, {form});
}

router.get(CHILDREN_DISABILITY_URL, async (req : express.Request, res : express.Response) => {
  try {
    const partnerSevereDisability = await childrenLiveWithYouDisabilityService.getChildrenLiveWithYouDisability(req.params.id);
    renderView(res, partnerSevereDisability);
  } catch (error) {
    logger.error(`${(error as Error).stack || error}`);
    res.status(500).send({error: error.message});
  }
});

router.post(CHILDREN_DISABILITY_URL,async (req: express.Request, res : express.Response) => {
  const childrenLiveWithYouDisability: ChildrenDisability = new ChildrenDisability(req.body.option);
  const errors: ValidationError[] = validator.validateSync(childrenLiveWithYouDisability);
  if (errors && errors.length > 0) {
    childrenLiveWithYouDisability.errors = errors;
    renderView(res, childrenLiveWithYouDisability);
  } else {
    try {
      await childrenLiveWithYouDisabilityService.saveChildrenLiveWithYouDisability(req.params.id, childrenLiveWithYouDisability);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_OTHER_DEPENDANTS_URL));
    } catch (error) {
      logger.error(`${(error as Error).stack || error}`);
      res.status(500).send({error: error.message});
    }
  }
});

export default router;
