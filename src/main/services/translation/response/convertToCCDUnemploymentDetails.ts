import {Unemployment} from "form/models/statementOfMeans/unemployment/unemployment";
import {
  CCDLengthOfUnemployment,
  CCDUnemploymentDetails,
  CCDUnemploymentType
} from "models/ccdResponse/ccdUnemploymentDetails";
import {UnemploymentCategory} from "form/models/statementOfMeans/unemployment/unemploymentCategory";
import {UnemploymentDetails} from "form/models/statementOfMeans/unemployment/unemploymentDetails";

export const toCCDUnemploymentDetails = (unemployment: Unemployment): CCDUnemploymentDetails => {
  return {
    unemployedComplexTypeRequired: toCCDUnemploymentType(unemployment?.option),
    lengthOfUnemployment: toCCDLengthOfUnemployment(unemployment?.unemploymentDetails),
    otherUnemployment: unemployment?.otherDetails?.details,
  }
}

const toCCDUnemploymentType = (option: UnemploymentCategory): CCDUnemploymentType => {
  switch (option) {
    case UnemploymentCategory.UNEMPLOYED:
      return CCDUnemploymentType.UNEMPLOYED;
    case UnemploymentCategory.RETIRED:
      return CCDUnemploymentType.RETIRED;
    case UnemploymentCategory.OTHER:
      return CCDUnemploymentType.OTHER;
    default:
      return undefined;
  }
}

const toCCDLengthOfUnemployment = (unemploymentDetails: UnemploymentDetails): CCDLengthOfUnemployment => {
  if (!unemploymentDetails) return undefined;
  return {
    numberOfYearsInUnemployment: unemploymentDetails?.years,
    numberOfMonthsInUnemployment: unemploymentDetails?.months,
  };
}
