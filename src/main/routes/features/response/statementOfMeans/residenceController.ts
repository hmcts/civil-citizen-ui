import express from 'express';
import {Residence} from '../../../../common/form/models/statementOfMeans/residence';
import {CITIZEN_PARTNER_URL, CITIZEN_RESIDENCE_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {ResidenceType} from '../../../../common/form/models/statementOfMeans/residenceType';
import residenceService from '../../../../services/features/response/statementOfMeans/residence/residenceService';

const residenceViewPath = 'features/response/statementOfMeans/residence';

const residenceController = express.Router();
residenceController
  .get(
    CITIZEN_RESIDENCE_URL,
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        const residence: Residence = await residenceService.getResidence(req.params.id);
        res.render(residenceViewPath, {form: new GenericForm(residence)});
      } catch (error) {
        next(error);
      }
    })
  .post(
    CITIZEN_RESIDENCE_URL,
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const residence = residenceService.buildResidence(ResidenceType.valueOf(req.body.type), req.body.housingDetails);
      const form: GenericForm<Residence> = residenceService.validateResidence(residence);

      if (form.hasErrors()) {
        res.render(residenceViewPath, {form});
      } else {
        try {
          await residenceService.saveResidence(req.params.id, residence);
          res.redirect(CITIZEN_PARTNER_URL.replace(':id', req.params.id));
        } catch (error) {
          next(error);
        }
      }
    });

export default residenceController;
