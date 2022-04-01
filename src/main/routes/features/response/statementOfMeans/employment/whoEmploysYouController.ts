import * as express from 'express';
import { WHO_EMPLOYS_YOU_URL } from '../../../../urls';
import { getEmployers, saveEmployers } from '../../../../../modules/statementOfMeans/employment/employerService';
import { Employers } from '../../../../../common/form/models/statementOfMeans/employment/employers';
import { Employer } from 'common/form/models/statementOfMeans/employment/employer';
import {validateForm, validateFormArray} from '../../../../../common/form/validators/formValidator';
// import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';

const whoEmploysYouViewPath = 'features/response/statementOfMeans/employment/who-employs-you';
const router = express.Router();

router.get(WHO_EMPLOYS_YOU_URL, async (req: express.Request, res: express.Response) => {
    try {
        const employers: Employers = await getEmployers(req.params.id);
        res.render(whoEmploysYouViewPath, { employers });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post(WHO_EMPLOYS_YOU_URL, async (req: express.Request, res: express.Response) => {
    try {
        const employers: Employers = new Employers(req.body.employers.map((employer: Employer) => new Employer(employer.employerName, employer.jobTitle)));
        await renderErrorsIfExist(employers, res, req.params.id);
        await saveEmployers(req.params.id, req.body.employers);
        res.status(200).send({ message: "REDIRECT TO NEXT PAGE" }); // TODO: redirect to the correct page
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

async function renderErrorsIfExist(employers: Employers, res: express.Response, claimId:string) {
    await validateForm(employers);
    await validateFormArray(employers.rows);
    if (employers.hasErrors()) {
      res.render(whoEmploysYouViewPath, { employers });
    } else {
      await saveEmployers(claimId, employers);
      res.status(200).send({ message: "REDIRECT TO NEXT PAGE" });
    //   res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_DISABILITY_URL));
    }
  }


export default router;