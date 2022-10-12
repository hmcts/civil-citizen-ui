import {NextFunction, Request, Response, Router} from 'express';
import {Residence} from '../../../../common/form/models/statementOfMeans/residence';
import {CITIZEN_PARTNER_URL, CITIZEN_RESIDENCE_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {ResidenceType} from '../../../../common/form/models/statementOfMeans/residenceType';
import {residenceService} from '../../../../services/features/response/statementOfMeans/residence/residenceService';

const residenceViewPath = 'features/response/statementOfMeans/residence';

const residenceController = Router();
residenceController
  .get(
    CITIZEN_RESIDENCE_URL,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.render(residenceViewPath, {form: new GenericForm(await residenceService.getResidence(req.params.id))});
      } catch (error) {
        next(error);
      }
    })
  .post(
    CITIZEN_RESIDENCE_URL,
    async (req: Request, res: Response, next: NextFunction) => {
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
