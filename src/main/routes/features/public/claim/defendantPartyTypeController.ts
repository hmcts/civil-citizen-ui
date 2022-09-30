import express from 'express';
import {CLAIM_DEFENDANT_PARTY_TYPE_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {PartyTypeSelection} from '../../../../common/form/models/claim/partyTypeSelection';
import {redirectToPage} from '../../../../services/features/claim/partyTypeService';
import {ClaimantOrDefendant} from '../../../../common/models/partyType';

const defendantPartyTypeViewPath = 'features/public/claim/defendant-party-type';
const defendantPartyTypeController = express.Router();

defendantPartyTypeController.get(CLAIM_DEFENDANT_PARTY_TYPE_URL, (req: express.Request, res: express.Response) => {
  const defendantPartyType = req.cookies.claim_issue_journey ? req.cookies.claim_issue_journey.defendantPartyType : null;
  const form = new GenericForm(new PartyTypeSelection(defendantPartyType));
  res.render(defendantPartyTypeViewPath, {form});
});

defendantPartyTypeController.post(CLAIM_DEFENDANT_PARTY_TYPE_URL, (req: express.Request, res: express.Response) => {
  const form = new GenericForm(new PartyTypeSelection(req.body.option));
  form.validateSync();

  if (form.hasErrors()) {
    res.render(defendantPartyTypeViewPath, {form});
  } else {
    const cookie = req.cookies['claim_issue_journey'] ? req.cookies['claim_issue_journey'] : {};
    cookie.defendantPartyType = req.body.option;
    res.cookie('claim_issue_journey', cookie);
    redirectToPage(form.model.option, res, ClaimantOrDefendant.DEFENDANT);
  }
});

export default defendantPartyTypeController;
