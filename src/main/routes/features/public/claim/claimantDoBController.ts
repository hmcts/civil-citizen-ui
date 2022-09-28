import express from 'express';
import {CLAIMANT_DOB_URL, CLAIMANT_PHONE_NUMBER_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {ClaimantDoB} from '../../../../common/form/models/claim/claimantDoB';

const claimantDoBController = express.Router();
const claimantDoBViewPath = 'features/public/claim/claimant-dob';

claimantDoBController.get(CLAIMANT_DOB_URL, (req: express.Request, res: express.Response) => {
  const cookie = req.cookies['claim_issue_journey'] ? req.cookies['claim_issue_journey'] : undefined;
  const form = new GenericForm(new ClaimantDoB(cookie?.claimantDoB?.day, cookie?.claimantDoB?.month, cookie?.claimantDoB?.year));
  res.render(claimantDoBViewPath, {form, today: new Date()});
});

claimantDoBController.post(CLAIMANT_DOB_URL, (req: express.Request, res: express.Response) => {
  const {year, month, day} = req.body;
  const form = new GenericForm(new ClaimantDoB(day, month, year));
  form.validateSync();

  if (form.hasErrors()) {
    res.render(claimantDoBViewPath, {form, today: new Date()});
  } else {
    const cookie = req.cookies['claim_issue_journey'] ? req.cookies['claim_issue_journey'] : {};
    cookie.claimantDoB = {year, month, day};
    res.cookie('claim_issue_journey', cookie);
    res.redirect(CLAIMANT_PHONE_NUMBER_URL);
  }
});

export default claimantDoBController;
