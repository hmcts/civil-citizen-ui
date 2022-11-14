import {NextFunction, Request, Response, Router} from 'express';
import {CLAIMANT_DOB_URL, CLAIMANT_PHONE_NUMBER_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {DateOfBirth} from '../../../../common/form/models/claim/claimant/dateOfBirth';
import {Claim} from '../../../../common/models/claim';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import {AppRequest} from '../../../../common/models/AppRequest';
import {saveClaimantProperty} from '../../../../../main/services/features/claim/yourDetails/claimantDetailsService';

const claimantDoBController = Router();
const claimantDoBViewPath = 'features/response/citizenDob/citizen-dob';

claimantDoBController.get(CLAIMANT_DOB_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const claim: Claim = await getCaseDataFromStore(caseId);
    let form = new GenericForm(new DateOfBirth());
    if (claim.applicant1?.dateOfBirth) {
      const dateOfBirth = new Date(claim.applicant1.dateOfBirth.date);
      form = new GenericForm(new DateOfBirth(dateOfBirth.getDate().toString(), (dateOfBirth.getMonth() + 1).toString(), dateOfBirth.getFullYear().toString()));
    }
    res.render(claimantDoBViewPath, {form, today: new Date(), claimantView: true});
  } catch (error) {
    next(error);
  }
});

claimantDoBController.post(CLAIMANT_DOB_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = (<AppRequest>req).session.user?.id;
    const {year, month, day} = req.body;
    const form = new GenericForm(new DateOfBirth(day, month, year));
    form.validateSync();

    if (form.hasErrors()) {
      res.render(claimantDoBViewPath, {form, today: new Date(), claimantView: true});
    } else {
      await saveClaimantProperty(claimId, 'dateOfBirth', form.model);
      res.redirect(CLAIMANT_PHONE_NUMBER_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default claimantDoBController;
