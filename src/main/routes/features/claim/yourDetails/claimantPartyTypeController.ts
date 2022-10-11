import express from 'express';
import {CLAIMANT_PARTY_TYPE_SELECTION_URL} from '../../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {PartyTypeSelection} from 'common/form/models/claim/partyTypeSelection';
import {ClaimantOrDefendant} from 'models/partyType';
import {redirectToPage} from '../../../../services/features/claim/partyTypeService';

const claimantPartyTypeViewPath = 'features/public/claim/claimant-party-type';
const claimantPartyTypeController = express.Router();

claimantPartyTypeController.get(CLAIMANT_PARTY_TYPE_SELECTION_URL, (req: express.Request, res: express.Response) => {
  // TODO: get from DraftStore
  const claimantPartyType = req.cookies.claim_issue_journey ? req.cookies.claim_issue_journey.claimantPartyType : null;
  const form = new GenericForm(new PartyTypeSelection(claimantPartyType));
  res.render(claimantPartyTypeViewPath, {form});
});

claimantPartyTypeController.post(CLAIMANT_PARTY_TYPE_SELECTION_URL, async (req: express.Request, res: express.Response) => {
  const form = new GenericForm(new PartyTypeSelection(req.body.option));
  await form.validate();

  if (form.hasErrors()) {
    res.render(claimantPartyTypeViewPath, {form});
  } else {
    // TODO: save to DraftStore
    const cookie = req.cookies['claim_issue_journey'] ? req.cookies['claim_issue_journey'] : {};
    cookie.claimantPartyType = req.body.option;

    res.cookie('claim_issue_journey', cookie);
    redirectToPage(form.model.option, res, ClaimantOrDefendant.CLAIMANT);
  }
});

export default claimantPartyTypeController;
