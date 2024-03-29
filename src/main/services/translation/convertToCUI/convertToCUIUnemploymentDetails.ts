import {Unemployment} from 'form/models/statementOfMeans/unemployment/unemployment';
import {
  CCDLengthOfUnemployment,
  CCDUnemploymentDetails,
  CCDUnemploymentType,
} from 'models/ccdResponse/ccdUnemploymentDetails';
import {UnemploymentCategory} from 'form/models/statementOfMeans/unemployment/unemploymentCategory';
import {UnemploymentDetails} from 'form/models/statementOfMeans/unemployment/unemploymentDetails';
import {OtherDetails} from 'form/models/statementOfMeans/unemployment/otherDetails';

export const toCUIUnemploymentDetails = (unemployment: CCDUnemploymentDetails): Unemployment => {
  if (unemployment) {
    return new Unemployment(
      toCUIUnemploymentCategory(unemployment.unemployedComplexTypeRequired),
      toCUILengthOfUnemployment(unemployment.lengthOfUnemployment),
      toCUIOtherDetails(unemployment.otherUnemployment));
  }
};

const toCUIUnemploymentCategory = (option: CCDUnemploymentType): UnemploymentCategory => {
  switch (option) {
    case  CCDUnemploymentType.UNEMPLOYED:
      return UnemploymentCategory.UNEMPLOYED;
    case CCDUnemploymentType.RETIRED:
      return UnemploymentCategory.RETIRED;
    case CCDUnemploymentType.OTHER:
      return UnemploymentCategory.OTHER;
    default:
      return undefined;
  }
};

const toCUILengthOfUnemployment = (lengthOfUnemployment: CCDLengthOfUnemployment): UnemploymentDetails=> {
  if (lengthOfUnemployment) {
    return new UnemploymentDetails(
      lengthOfUnemployment.numberOfYearsInUnemployment?.toString(),
      lengthOfUnemployment.numberOfMonthsInUnemployment?.toString(),
    );
  }
};

const toCUIOtherDetails = (otherDetails: string): OtherDetails=> {
  if (otherDetails) return new OtherDetails(otherDetails);
};
