import express from 'express';
import {CLAIMANT_PARTY_TYPE_SELECTION_URL,CLAIMANT_INDIVIDUAL_DETAILS_URL,CLAIMANT_SOLE_TRADER_DETAILS_URL,CLAIMANT_COMPANY_DETAILS_URL,CLAIMANT_ORGANISATION_DETAILS_URL} from '../../../urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {ClaimantPartyTypeSelection} from '../../../../common/form/models/claim/claimantPartyTypeSelection';
import {CounterpartyType} from '../../../../common/models/counterpartyType';

const claimantPartyTypeViewPath = 'features/public/claim/claimant-party-type';
const claimantPartyTypeController = express.Router();

const redirect = (counterpartyType: CounterpartyType, res: express.Response) => {
  switch (counterpartyType) {
    case CounterpartyType.INDIVIDUAL:
      res.redirect(CLAIMANT_INDIVIDUAL_DETAILS_URL);
      break;
    case CounterpartyType.SOLE_TRADER:
      res.redirect(CLAIMANT_SOLE_TRADER_DETAILS_URL);
      break;
    case CounterpartyType.COMPANY:
      res.redirect(CLAIMANT_COMPANY_DETAILS_URL);
      break;
    case CounterpartyType.ORGANISATION:
      res.redirect(CLAIMANT_ORGANISATION_DETAILS_URL);
      break;
    default:
      res.render('not-found');
      break;
  }
};

claimantPartyTypeController.get(CLAIMANT_PARTY_TYPE_SELECTION_URL, (req: express.Request, res: express.Response) => {
  const claimantPartyType = req.cookies.claim_issue_journey ? req.cookies.claim_issue_journey.claimantPartyType : null;
  const form = new GenericForm(new ClaimantPartyTypeSelection(claimantPartyType));
  res.render(claimantPartyTypeViewPath, {form});
});

claimantPartyTypeController.post(CLAIMANT_PARTY_TYPE_SELECTION_URL, async (req: express.Request, res: express.Response) => {
  const form = new GenericForm(new ClaimantPartyTypeSelection(req.body.option));
  await form.validate();

  if (form.hasErrors()) {
    res.render(claimantPartyTypeViewPath, {form});
  } else {
    const cookie = req.cookies['claim_issue_journey'] ? req.cookies['claim_issue_journey'] : {};
    cookie.claimantPartyType = req.body.option;
    res.cookie('claim_issue_journey', cookie);
    redirect(form.model.option, res);
  }
});

export default claimantPartyTypeController;
