export interface CCDUpload {
  detailsOfWhyDoesYouDisputeTheClaim: string
  respondent1SpecDefenceResponseDocument?: CCDResponseDocument
}

export interface CCDResponseDocument {
  file: CCDDocument
}

export interface CCDDocument {
  document: string,
  documentBinaryUrl: string,
  documentFileName: string
  documentHash: string
}
