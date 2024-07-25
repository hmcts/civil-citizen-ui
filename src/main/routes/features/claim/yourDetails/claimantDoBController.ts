import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CLAIMANT_DOB_URL, CLAIMANT_PHONE_NUMBER_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';
import {
  getCaseDataFromStore,
  saveDraftClaim,
} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {getDOBforAgeFromCurrentTime} from 'common/utils/dateUtils';
import { DOBDate } from 'common/form/models/claim/claimant/dobDate';

const claimantDoBController = Router();
const claimantDoBViewPath = 'features/response/citizenDob/citizen-dob';
const pageTitle= 'PAGES.CLAIMANT_DOB.PAGE_TITLE';

claimantDoBController.get(CLAIMANT_DOB_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const claim: Claim = await getCaseDataFromStore(caseId);
    let form = new GenericForm(new DOBDate());
    if (claim.applicant1?.dateOfBirth) {
      const dateOfBirth = new Date(claim.applicant1.dateOfBirth as unknown as string);
      form = new GenericForm(new DOBDate(dateOfBirth.getDate().toString(), (dateOfBirth.getMonth() + 1).toString(), dateOfBirth.getFullYear().toString()));
    }
    res.render(claimantDoBViewPath, {form, today: new Date(), claimantView: true, maxDateForAge18: getDOBforAgeFromCurrentTime(18), pageTitle });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

claimantDoBController.post(CLAIMANT_DOB_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = (<AppRequest>req).session.user?.id;
    const {year, month, day} = req.body;
    const form = new GenericForm(new DOBDate(day, month, year));
    form.validateSync();

    if (form.hasErrors()) {
      res.render(claimantDoBViewPath, {form, today: new Date(), claimantView: true, maxDateForAge18: getDOBforAgeFromCurrentTime(18), pageTitle});
    } else {
      const claim = await getCaseDataFromStore(claimId);
      claim.applicant1.dateOfBirth = new DOBDate(day, month, year);
      await saveDraftClaim(claimId, claim);
      res.redirect(CLAIMANT_PHONE_NUMBER_URL);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantDoBController;
