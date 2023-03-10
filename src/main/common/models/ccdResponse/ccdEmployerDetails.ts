export interface CCDEmployerDetails {
  employerDetails?: CCDEmployerDetailsList[],
}

export interface CCDEmployerDetailsList {
  id?: string,
  value?: CCDEmployerDetailsItem,
}

export interface CCDEmployerDetailsItem {
  employerName?: string,
  jobTitle?: string,
}
