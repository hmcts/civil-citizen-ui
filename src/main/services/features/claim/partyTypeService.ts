import express from 'express';
import {ClaimantOrDefendant, PartyType} from '../../../common/models/partyType';
import {
  CLAIM_DEFENDANT_COMPANY_DETAILS,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS,
  CLAIMANT_COMPANY_DETAILS_URL,
  CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIMANT_ORGANISATION_DETAILS_URL,
  CLAIMANT_SOLE_TRADER_DETAILS_URL,
} from '../../../routes/urls';

const redirectToPage = (partyType: PartyType, res: express.Response, claimantOrDefendant: ClaimantOrDefendant) => {
  switch (partyType) {
    case PartyType.INDIVIDUAL:
      (claimantOrDefendant === ClaimantOrDefendant.CLAIMANT) ?
        res.redirect(CLAIMANT_INDIVIDUAL_DETAILS_URL) :
        res.redirect(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS);
      break;
    case PartyType.SOLE_TRADER:
      (claimantOrDefendant === ClaimantOrDefendant.CLAIMANT) ?
        res.redirect(CLAIMANT_SOLE_TRADER_DETAILS_URL) :
        res.redirect(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS);
      break;
    case PartyType.COMPANY:
      (claimantOrDefendant === ClaimantOrDefendant.CLAIMANT) ?
        res.redirect(CLAIMANT_COMPANY_DETAILS_URL) :
        res.redirect(CLAIM_DEFENDANT_COMPANY_DETAILS);
      break;
    case PartyType.ORGANISATION:
      (claimantOrDefendant === ClaimantOrDefendant.CLAIMANT) ?
        res.redirect(CLAIMANT_ORGANISATION_DETAILS_URL) :
        res.redirect(CLAIM_DEFENDANT_ORGANISATION_DETAILS);
      break;
    default:
      res.render('not-found');
      break;
  }
};

export {
  redirectToPage,
};
