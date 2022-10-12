import {NextFunction, Request, Response, Router} from 'express';
import {CLAIMANT_DOB_URL, CLAIMANT_PHONE_NUMBER_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {ClaimantDoB} from '../../../../common/form/models/claim/claimant/claimantDoB';
import {Claim} from '../../../../common/models/claim';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {AppRequest} from '../../../../common/models/AppRequest';
import {Party} from '../../../../common/models/party';

const claimantDoBController = Router();
const claimantDoBViewPath = 'features/response/citizenDob/citizen-dob';

claimantDoBController.get(CLAIMANT_DOB_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const caseId = req.session?.user?.id;
    const claim: Claim = await getCaseDataFromStore(caseId);
    let form = new GenericForm(new ClaimantDoB());
    if (claim?.respondent1?.dateOfBirth) {
      const dateOfBirth = new Date(claim.respondent1.dateOfBirth);
      form = new GenericForm(new ClaimantDoB(dateOfBirth.getDate().toString(), (dateOfBirth.getMonth() + 1).toString(), dateOfBirth.getFullYear().toString()));
    }
    res.render(claimantDoBViewPath, {form, today: new Date(), claimantView: true});
  } catch (error) {
    next(error);
  }
});

claimantDoBController.post(CLAIMANT_DOB_URL, async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const caseId = (<AppRequest>req).session?.user?.id;
    const {year, month, day} = req.body;
    const form = new GenericForm(new ClaimantDoB(day, month, year));
    form.validateSync();

    if (form.hasErrors()) {
      res.render(claimantDoBViewPath, {form, today: new Date(), claimantView: true});
    } else {
      const claim = await getCaseDataFromStore(caseId);
      if (claim.respondent1) {
        claim.respondent1.dateOfBirth = form.model.dateOfBirth;
      } else {
        const respondent = new Party();
        respondent.dateOfBirth = form.model.dateOfBirth;
        claim.respondent1 = respondent;
      }
      await saveDraftClaim(caseId, claim);
      res.redirect(CLAIMANT_PHONE_NUMBER_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default claimantDoBController;
