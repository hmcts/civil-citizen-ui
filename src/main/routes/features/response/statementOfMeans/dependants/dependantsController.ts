import express from 'express';
import {Dependants} from '../../../../../common/form/models/statementOfMeans/dependants/dependants';
import {CITIZEN_DEPENDANTS_URL, CITIZEN_PARTNER_URL} from '../../../../urls';
import {GenericForm} from '../../../../../common/form/models/genericForm';
import dependantsService from '../../../../../modules/statementOfMeans/dependants/dependantsService';

const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('residenceController');
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
          await dependantsService.saveDependants(req.params.id, dependants);
          res.redirect(CITIZEN_PARTNER_URL.replace(':id', req.params.id));
        } catch (error) {
          logger.error(`${error.stack || error}`);
          res.status(500).send({errorMessage: error.message, errorStack: error.stack});
        }
      }
    });

export default dependantsController;
