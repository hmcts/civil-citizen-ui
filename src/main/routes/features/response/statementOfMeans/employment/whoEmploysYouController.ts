import * as express from 'express';
import {CITIZEN_COURT_ORDERS_URL, CITIZEN_SELF_EMPLOYED_URL, CITIZEN_WHO_EMPLOYS_YOU_URL} from '../../../../urls';
import {getEmployers, saveEmployers} from '../../../../../modules/statementOfMeans/employment/employerService';
import {Employers} from '../../../../../common/form/models/statementOfMeans/employment/employers';
import {Employer} from '../../../../../common/form/models/statementOfMeans/employment/employer';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {getEmploymentForm} from '../../../../../modules/statementOfMeans/employment/employmentService';
import {EmploymentForm} from '../../../../../common/form/models/statementOfMeans/employment/employmentForm';
import {GenericForm} from '../../../../../common/form/models/genericForm';

const whoEmploysYouViewPath = 'features/response/statementOfMeans/employment/who-employs-you';
const whoEmploysYouController = express.Router();

whoEmploysYouController.get(CITIZEN_WHO_EMPLOYS_YOU_URL, async (req: express.Request, res: express.Response) => {
  try {
    const employers: Employers = await getEmployers(req.params.id);
    const form = new GenericForm(employers);
    res.render(whoEmploysYouViewPath, { form });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

whoEmploysYouController.post(CITIZEN_WHO_EMPLOYS_YOU_URL, async (req: express.Request, res: express.Response) => {
  try {
    const claimId = req.params.id;
    const employers: Employers = new Employers(req.body.rows.map((employer: Employer) => new Employer(employer.employerName, employer.jobTitle)));
    const form = new GenericForm(employers);
    form.validateSync();
    if (form.hasErrors()) {
      res.render(whoEmploysYouViewPath, { form });
    } else {
      await saveEmployers(claimId, employers);
      const employment: EmploymentForm = await getEmploymentForm(claimId);
      if (employment.isEmployed()) {
        res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
      } else if (employment.isEmployedAndSelfEmployed()) {
        res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_SELF_EMPLOYED_URL));
      } else {
        res.status(500);
        res.render('error');
      }
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

export default whoEmploysYouController;
