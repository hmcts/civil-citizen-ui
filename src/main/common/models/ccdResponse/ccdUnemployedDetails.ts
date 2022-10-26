export interface CCDUnemployedDetails {
  unemployedComplexTypeRequired: string,
  lengthOfUnemployment: {
    numberOfMonthsInUnemployment: string,
    numberOfYearsInUnemployment: string,
  },
  otherUnemployment: string,
}