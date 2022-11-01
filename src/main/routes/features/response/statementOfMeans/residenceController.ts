import {NextFunction, Request, Response, Router} from 'express';
import {Residence} from 'common/form/models/statementOfMeans/residence/residence';
import {CITIZEN_PARTNER_URL, CITIZEN_RESIDENCE_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {
  getResidence,
  getResidenceForm,
  saveResidence,
} from '../../../../services/features/response/statementOfMeans/residence/residenceService';

const residenceViewPath = 'features/response/statementOfMeans/residence';

const residenceController = Router();
residenceController.get(
  CITIZEN_RESIDENCE_URL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const residence = await getResidence(req.params.id);
      res.render(residenceViewPath, {form: new GenericForm(residence)});
    } catch (error) {
      next(error);
    }
  }
);

residenceController.post(
  CITIZEN_RESIDENCE_URL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const residence = getResidenceForm(req.body.type, req.body.housingDetails)
      const form: GenericForm<Residence> = new GenericForm(residence);

      form.validateSync();

      if (form.hasErrors()) {
        res.render(residenceViewPath, {form});
      } else {
        await saveResidence(req.params.id, residence);
        res.redirect(CITIZEN_PARTNER_URL.replace(':id', req.params.id));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default residenceController;
