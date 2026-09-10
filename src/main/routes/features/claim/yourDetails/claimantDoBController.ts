import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CLAIMANT_DOB_URL, CLAIMANT_PHONE_NUMBER_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {getClaimantInformation, saveClaimantProperty} from 'services/features/claim/yourDetails/claimantDetailsService';
import {AppRequest} from 'models/AppRequest';
import {getDOBforAgeFromCurrentTime} from 'common/utils/dateUtils';
import { DOBDate } from 'common/form/models/claim/claimant/dobDate';

const claimantDoBController = Router();
const claimantDoBViewPath = 'features/response/citizenDob/citizen-dob';
const pageTitle= 'PAGES.CLAIMANT_DOB.PAGE_TITLE';

function getDateOfBirth(dateOfBirth: unknown): Date | undefined {
  if (!dateOfBirth) {
    return undefined;
  }

  const storedDate = typeof dateOfBirth === 'object' && 'date' in dateOfBirth
    ? (dateOfBirth as DOBDate).date
    : dateOfBirth;
  const date = new Date(storedDate as string);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

claimantDoBController.get(CLAIMANT_DOB_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimant = await getClaimantInformation(req);
    let form = new GenericForm(new DOBDate());
    const dateOfBirth = getDateOfBirth(claimant?.dateOfBirth);
    if (dateOfBirth) {
      form = new GenericForm(new DOBDate(dateOfBirth.getDate().toString(), (dateOfBirth.getMonth() + 1).toString(), dateOfBirth.getFullYear().toString()));
    }
    res.render(claimantDoBViewPath, {form, today: new Date(), claimantView: true, maxDateForAge18: getDOBforAgeFromCurrentTime(18), pageTitle });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

claimantDoBController.post(CLAIMANT_DOB_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const {year, month, day} = req.body;
    const form = new GenericForm(new DOBDate(day, month, year));
    form.validateSync();

    if (form.hasErrors()) {
      res.render(claimantDoBViewPath, {form, today: new Date(), claimantView: true, maxDateForAge18: getDOBforAgeFromCurrentTime(18), pageTitle});
    } else {
      await saveClaimantProperty(req, 'dateOfBirth', new DOBDate(day, month, year));
      res.redirect(CLAIMANT_PHONE_NUMBER_URL);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantDoBController;
