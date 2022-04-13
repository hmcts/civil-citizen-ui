import * as express from 'express';
import {CHILDREN_DISABILITY_URL, CITIZEN_OTHER_DEPENDANTS_URL} from '../../../../urls';
import {ChildrenDisability} from '../../../../../common/form/models/statementOfMeans/dependants/childrenDisability';
import {
  getChildrenDisability,
  saveChildrenDisability,
} from '../../../../../modules/statementOfMeans/dependants/childrenDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {GenericForm} from '../../../../../common/form/models/genericForm';


const childrenDisabilityViewPath = 'features/response/statementOfMeans/dependants/children-disability';
const childrenDisabilityController = express.Router();
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('childrenDisabilityController');




childrenDisabilityController
  .get(CHILDREN_DISABILITY_URL,
    async (req: express.Request, res: express.Response) => {
      try {
        const childrenDisability : ChildrenDisability = await getChildrenDisability(req.params.id);
        res.render(childrenDisabilityViewPath,{
          form: new GenericForm(childrenDisability),
        });
      } catch (error) {
        logger.error(error);
        res.status(500).send({errorMessage: error.message, errorStack: error.stack});
      }
    })
  .post(
    CHILDREN_DISABILITY_URL,
    async (req: express.Request, res: express.Response) => {
      const childrenDisability: ChildrenDisability = new ChildrenDisability(req.body.option);
      const form: GenericForm<ChildrenDisability> = new GenericForm(childrenDisability);
      await form.validate();

      if (form.hasErrors()) {
        res.render(childrenDisabilityViewPath, {
          form: form,
        });
      } else {
        try {
          await saveChildrenDisability(req.params.id, childrenDisability);
          res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_OTHER_DEPENDANTS_URL));
        }
        catch (error) {
          logger.error(error);
          res.status(500).send({errorMessage: error.message, errorStack: error.stack});
        }
      }
    });

export default childrenDisabilityController;
