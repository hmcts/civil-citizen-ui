import {Residence} from 'form/models/statementOfMeans/residence/residence';
import {CCDHomeDetails, CCDHomeType} from 'models/ccdResponse/ccdHomeDetails';
import {ResidenceType} from 'form/models/statementOfMeans/residence/residenceType';

export const toCUIHomeDetails = (ccdHomeDetails: CCDHomeDetails): Residence => {
  if (!ccdHomeDetails) return undefined;
  return new Residence(toCUIResidenceType(ccdHomeDetails.type), ccdHomeDetails.typeOtherDetails);
};

const toCUIResidenceType = (type: CCDHomeType): ResidenceType=> {
  switch (type) {
    case CCDHomeType.OWNED_HOME:
      return ResidenceType.OWN_HOME;
    case CCDHomeType.JOINTLY_OWNED_HOME:
      return ResidenceType.JOINT_OWN_HOME;
    case CCDHomeType.PRIVATE_RENTAL:
      return ResidenceType.PRIVATE_RENTAL;
    case CCDHomeType.ASSOCIATION_HOME:
      return ResidenceType.COUNCIL_OR_HOUSING_ASSN_HOME;
    case CCDHomeType.OTHER:
      return ResidenceType.OTHER;
    default:
      return undefined;
  }
};
