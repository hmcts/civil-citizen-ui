import express from 'express';
import {Residence} from '../../../../common/form/models/statementOfMeans/residence';
import {CITIZEN_PARTNER_URL, CITIZEN_RESIDENCE_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {ResidenceType} from '../../../../common/form/models/statementOfMeans/residenceType';
import residenceService from '../../../../modules/statementOfMeans/residence/residenceService';

const {Logger} = require('@hmcts/nodejs-logging');

const logger = Logger.getLogger('residenceController');
const residenceViewPath = 'features/response/statementOfMeans/residence';

const residenceController = express.Router();
residenceController
  .get(
    CITIZEN_RESIDENCE_URL,
    async (req: express.Request, res: express.Response) => {
      try {
        const residence: Residence = await residenceService.getResidence(req.params.id);
        // Jira/CIV-1711 : prevent displaying unnecessary error message on view
        const residenceDetails = new GenericForm(residence);
        const errors = residenceDetails.getErrors().length ? residenceDetails.getErrors() :null;
        res.render(residenceViewPath, {
          form: new GenericForm(residence), errors,
        });
      } catch (error) {
        logger.error(`${error.stack || error}`);
        res.status(500).send({errorMessage: error.message, errorStack: error.stack});
      }
    })
  .post(
    CITIZEN_RESIDENCE_URL,
    async (req: express.Request, res: express.Response) => {
      const residence = residenceService.buildResidence(ResidenceType.valueOf(req.body.type), req.body.housingDetails);
      const form: GenericForm<Residence> = residenceService.validateResidence(residence);

      if (form.hasErrors()) {
        res.render(residenceViewPath, {
          form: form,
        });
      } else {
        try {
          await residenceService.saveResidence(req.params.id, residence);
          res.redirect(CITIZEN_PARTNER_URL.replace(':id', req.params.id));
        } catch (error) {
          logger.error(`${error.stack || error}`);
          res.status(500).send({errorMessage: error.message, errorStack: error.stack});
        }
      }
    });

export default residenceController;
