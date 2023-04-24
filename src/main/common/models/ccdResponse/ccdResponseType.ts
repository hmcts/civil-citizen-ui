export interface CCDRespondentResponse {
  respondent1ClaimResponseType: CCDResponseType
}
export enum CCDResponseType {
  FULL_DEFENCE = 'FULL_DEFENCE',
  FULL_ADMISSION = 'FULL_ADMISSION',
  PART_ADMISSION = 'PART_ADMISSION',
  COUNTER_CLAIM = 'COUNTER_CLAIM'
}
