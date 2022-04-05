import * as express from 'express';
import { SELF_EMPLOYED_URL, COURT_ORDERS_URL, WHO_EMPLOYS_YOU_URL } from '../../../../urls';
import { getEmployers, saveEmployers } from '../../../../../modules/statementOfMeans/employment/employerService';
import { Employers } from '../../../../../common/form/models/statementOfMeans/employment/employers';
import { Employer } from '../../../../../common/form/models/statementOfMeans/employment/employer';
import { validateForm, validateFormArray } from '../../../../../common/form/validators/formValidator';
import { constructResponseUrlWithIdParams } from '../../../../../common/utils/urlFormatter';
import { getEmploymentForm } from '../../../../../modules/statementOfMeans/employment/employmentService';
import { EmploymentForm } from '../../../../../common/form/models/statementOfMeans/employment/employmentForm';

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
        const claimId = req.params.id;
        const employers: Employers = new Employers(req.body.employers.map((employer: Employer) => new Employer(employer.employerName, employer.jobTitle)));
        await validateForm(employers);
        await validateFormArray(employers.rows);
        if (employers.hasErrors()) {
            res.render(whoEmploysYouViewPath, { employers });
        } else {
            await saveEmployers(claimId, employers);
            const employment: EmploymentForm = await getEmploymentForm(claimId);
            if (employment.isEmployed()) {
                res.redirect(constructResponseUrlWithIdParams(claimId, COURT_ORDERS_URL));
            } else if (employment.isEmployedAndSelfEmployed()) {
                res.redirect(constructResponseUrlWithIdParams(claimId, SELF_EMPLOYED_URL));
            } else {
                // TODO: midleware handler
                res.status(404);
                res.render('not-found');
            }
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default router;