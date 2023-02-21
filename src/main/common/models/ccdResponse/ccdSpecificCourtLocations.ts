import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDCaseLocationCivil {
  region?: string,
  baseLocation: string,
}

export interface CCDSpecificCourtLocations {
  requestHearingAtSpecificCourt?: YesNoUpperCamelCase,
  otherPartyPreferredSite?: string,
  responseCourtCode: string,
  reasonForHearingAtSpecificCourt : string,
  responseCourtLocations: string [],
  caseLocation: CCDCaseLocationCivil,
}
