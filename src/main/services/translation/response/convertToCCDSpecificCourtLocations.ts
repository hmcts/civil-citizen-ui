import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';

function toCCDCaseLocationCivil(specificCourtLocation: SpecificCourtLocation) {
  return {
    region: specificCourtLocation?.courtLocation,
    baseLocation: specificCourtLocation?.courtLocation,
  };
}

export const toCCDSpecificCourtLocations = (specificCourtLocation: SpecificCourtLocation) => {
  const courtList: string[] = [];
  return {
    requestHearingAtSpecificCourt: toCCDYesNo(specificCourtLocation?.option),
    otherPartyPreferredSite: '',
    responseCourtCode:'',
    reasonForHearingAtSpecificCourt : specificCourtLocation?.reason,
    responseCourtLocations: courtList,
    caseLocation: toCCDCaseLocationCivil(specificCourtLocation),
  };
};
