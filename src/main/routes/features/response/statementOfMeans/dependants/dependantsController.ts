import express from 'express';
import {Dependants} from '../../../../../common/form/models/statementOfMeans/dependants/dependants';
import {
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_DEPENDANTS_EDUCATION_URL,
  CITIZEN_OTHER_DEPENDANTS_URL, CHILDREN_DISABILITY_URL,
} from '../../../../urls';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import dependantsService from '../../../../../modules/statementOfMeans/dependants/dependantsService';
import {isCheckChildrenDisabled} from '../../../../../modules/statementOfMeans/dependants/childrenDisabilityService';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';

const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('dependantsController');
const residenceViewPath = 'features/response/statementOfMeans/dependants/dependants';

const dependantsController = express.Router();
dependantsController
  .get(
    CITIZEN_DEPENDANTS_URL,
    async (req: express.Request, res: express.Response) => {
      try {
        const dependants: Dependants = await dependantsService.getDependants(req.params.id);
        res.render(residenceViewPath, {
          form: new GenericForm(dependants),
        });
      } catch (error) {
        logger.error(`${error.stack || error}`);
        res.status(500).send({errorMessage: error.message, errorStack: error.stack});
      }
    })
  .post(
    CITIZEN_DEPENDANTS_URL,
    async (req: express.Request, res: express.Response) => {
      const dependants = dependantsService.buildDependants(req.body.declared, req.body.under11,
        req.body.between11and15, req.body.between16and19);
      const form: GenericForm<Dependants> = dependantsService.validateDependants(dependants);

      if (form.hasErrors() || form.hasNestedErrors()) {
        res.render(residenceViewPath, {
          form: form,
        });
      } else {
        try {
          const claim = await dependantsService.saveDependants(req.params.id, dependants);
          const askIfChildrenDisabled = isCheckChildrenDisabled(claim);
          if (dependants.hasChildrenBetween16and19()) {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_DEPENDANTS_EDUCATION_URL));
          } else if (askIfChildrenDisabled) {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CHILDREN_DISABILITY_URL));
          } else {
            res.redirect(constructResponseUrlWithIdParams(req.params.id, CITIZEN_OTHER_DEPENDANTS_URL));
          }
        } catch (error) {
          logger.error(`${error.stack || error}`);
          res.status(500).send({errorMessage: error.message, errorStack: error.stack});
        }
      }
    });

export default dependantsController;
