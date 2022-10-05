import {PartyType} from '../../../common/models/partyType';

const getPartyTypeDependingOnRoute = (urlRoute: string): PartyType => {
  //'/claim/defendant-company-details',
  //       '/claim/defendant-individual-details',
  //       '/claim/defendant-organisation-details',
  //       '/claim/defendant-sole-trader-details'
  switch (urlRoute) {
    case '/claim/defendant-company-details':
      return PartyType.COMPANY;
    default:
      return undefined;
  }
};

export {
  getPartyTypeDependingOnRoute,
};
