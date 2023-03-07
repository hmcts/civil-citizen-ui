import {Residence} from 'form/models/statementOfMeans/residence/residence';
import {CCDHomeDetails, CCDHomeType} from 'models/ccdResponse/ccdHomeDetails';
import {ResidenceType} from 'form/models/statementOfMeans/residence/residenceType';

export const toCCDHomeDetails = (residence: Residence): CCDHomeDetails => {
  return {
    type: toCCDHomeType(residence?.type),
    typeOtherDetails: residence?.housingDetails,
  };
};

const toCCDHomeType = (type: ResidenceType): CCDHomeType => {
  switch (type) {
    case ResidenceType.OWN_HOME:
      return CCDHomeType.OWNED_HOME;
    case ResidenceType.JOINT_OWN_HOME:
      return CCDHomeType.JOINTLY_OWNED_HOME;
    case ResidenceType.PRIVATE_RENTAL:
      return CCDHomeType.PRIVATE_RENTAL;
    case ResidenceType.COUNCIL_OR_HOUSING_ASSN_HOME:
      return CCDHomeType.ASSOCIATION_HOME;
    case ResidenceType.OTHER:
      return CCDHomeType.OTHER;
    default:
      return undefined;
  }
};
