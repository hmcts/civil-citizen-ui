import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';

function toCCDCaseLocationCivil(specificCourtLocation: SpecificCourtLocation) {
  return {
    region: specificCourtLocation?.courtLocation,
    baseLocation: specificCourtLocation?.courtLocation,
  };
}

export const toCCDSpecificCourtLocations = (specificCourtLocation: SpecificCourtLocation) => {
  const courtList: string[] = [];
  return {
    otherPartyPreferredSite: '',
    responseCourtCode:'',
    reasonForHearingAtSpecificCourt : specificCourtLocation?.reason,
    responseCourtLocations: courtList,
    caseLocation: toCCDCaseLocationCivil(specificCourtLocation),
  };
};
