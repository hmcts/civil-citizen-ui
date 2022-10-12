import {PartyType} from '../../../common/models/partyType';

const getPartyTypeDependingOnRoute = (urlRoute: string): PartyType => {
  switch (urlRoute) {
    case '/claim/claimant-company-details':
    case '/claim/defendant-company-details':
      return PartyType.COMPANY;
    case '/claim/claimant-individual-details':
    case '/claim/defendant-individual-details':
      return PartyType.INDIVIDUAL;
    case '/claim/claimant-organisation-details':
    case '/claim/defendant-organisation-details':
      return PartyType.ORGANISATION;
    case '/claim/claimant-sole-trader-details':
    case '/claim/defendant-sole-trader-details':
      return PartyType.SOLE_TRADER;
    default:
      return undefined;
  }
};

export {
  getPartyTypeDependingOnRoute,
};
