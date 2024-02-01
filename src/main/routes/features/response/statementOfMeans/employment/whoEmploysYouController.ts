import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CITIZEN_COURT_ORDERS_URL, CITIZEN_SELF_EMPLOYED_URL, CITIZEN_WHO_EMPLOYS_YOU_URL} from '../../../../urls';
import {
  getEmployers,
  saveEmployers,
} from 'services/features/response/statementOfMeans/employment/employerService';
import {Employers} from 'form/models/statementOfMeans/employment/employers';
import {Employer} from 'form/models/statementOfMeans/employment/employer';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getEmploymentForm} from 'services/features/response/statementOfMeans/employment/employmentService';
import {EmploymentForm} from 'form/models/statementOfMeans/employment/employmentForm';
import {GenericForm} from 'form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const whoEmploysYouViewPath = 'features/response/statementOfMeans/employment/who-employs-you';
const whoEmploysYouController = Router();

whoEmploysYouController.get(CITIZEN_WHO_EMPLOYS_YOU_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const form = new GenericForm(await getEmployers(generateRedisKey(<AppRequest>req)));
    res.render(whoEmploysYouViewPath, {form});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

whoEmploysYouController.post(CITIZEN_WHO_EMPLOYS_YOU_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const employers: Employers = new Employers(req.body.rows.map((employer: Employer) => new Employer(employer.employerName, employer.jobTitle)));
    const form = new GenericForm(employers);
    form.validateSync();
    if (form.hasErrors()) {
      res.render(whoEmploysYouViewPath, {form});
    } else {
      await saveEmployers(redisKey, employers);
      const employment: GenericForm<EmploymentForm> = await getEmploymentForm(redisKey);
      if (employment.model.isEmployed()) {
        res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_COURT_ORDERS_URL));
      } else if (employment.model.isEmployedAndSelfEmployed()) {
        res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_SELF_EMPLOYED_URL));
      } else {
        res.status(500);
        res.render('error');
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default whoEmploysYouController;
