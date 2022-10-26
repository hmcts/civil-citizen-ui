import {ResidenceType} from "../../../common/form/models/statementOfMeans/residenceType";
import {CCDHomeType} from "../../../common/models/ccdResponse/ccdHomeType";

export const toCCDHomeType = (residenceType: ResidenceType): CCDHomeType => {
  switch (residenceType) {
    case ResidenceType.OWN_HOME:
      return CCDHomeType.OWNED_HOME;
    case ResidenceType.JOINT_OWN_HOME:
      return CCDHomeType.JOINTLY_OWNED_HOME;
    case ResidenceType.PRIVATE_RENTAL:
      return CCDHomeType.PRIVATE_RENTAL;
    case ResidenceType.COUNCIL_OR_HOUSING_ASSN_HOME:
      return CCDHomeType.ASSOCIATION_HOME
    default: return CCDHomeType.OTHER;
  }
};
