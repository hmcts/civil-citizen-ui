export interface CCDUnemploymentDetails {
  unemployedComplexTypeRequired?: CCDUnemploymentType,
  lengthOfUnemployment?: CCDLengthOfUnemployment,
  otherUnemployment?: string,
}

export interface CCDLengthOfUnemployment {
  numberOfYearsInUnemployment?: number,
  numberOfMonthsInUnemployment?: number
}

export enum CCDUnemploymentType {
  UNEMPLOYED = 'UNEMPLOYED',
  RETIRED = 'RETIRED',
  OTHER = 'OTHER',
}
