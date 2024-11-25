import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'common/models/directionsQuestionnaire/hearing/hearing';
import {CCDSpecificCourtLocations} from 'models/ccdResponse/ccdSpecificCourtLocations';
import {toCCDSpecificCourtLocations} from 'services/translation/response/convertToCCDSpecificCourtLocations';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';

describe('translate Welsh Language requirement to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  claim.directionQuestionnaire.hearing = new Hearing();
  claim.directionQuestionnaire.hearing.specificCourtLocation = new SpecificCourtLocation();

  it('should return undefined if items doesnt exist', () => {
    //given
    const expected: CCDSpecificCourtLocations = {
      otherPartyPreferredSite: '',
      responseCourtCode: '',
      reasonForHearingAtSpecificCourt : undefined,
      responseCourtLocations:[],
      caseLocation: {
        baseLocation: undefined,
        region: undefined,
      },
    };

    //When
    const specificCourtLocationCCD = toCCDSpecificCourtLocations(claim.directionQuestionnaire.hearing.specificCourtLocation);
    //then
    expect(specificCourtLocationCCD).toEqual(expected);
  });

  it('should return data when it exists and want hearing to be held in specific court ', () => {
    //given
    const specificCourtLocation = new SpecificCourtLocation('location', 'reason');

    const expected: CCDSpecificCourtLocations = {
      otherPartyPreferredSite: '',
      responseCourtCode: '',
      reasonForHearingAtSpecificCourt : 'reason',
      responseCourtLocations:[],
      caseLocation: {
        baseLocation: 'location',
        region: 'location',
      },
    };

    //When
    const specificCourtLocationCCD = toCCDSpecificCourtLocations(specificCourtLocation);
    //then
    expect(specificCourtLocationCCD).toEqual(expected);
  });

  it('should return data when it exists and dont want hearing to be held in specific court ', () => {
    //given
    const specificCourtLocation = new SpecificCourtLocation( '', '');

    const expected: CCDSpecificCourtLocations = {
      otherPartyPreferredSite: '',
      responseCourtCode: '',
      reasonForHearingAtSpecificCourt : '',
      responseCourtLocations:[],
      caseLocation: {
        baseLocation: '',
        region: '',
      },
    };

    //When
    const specificCourtLocationCCD = toCCDSpecificCourtLocations(specificCourtLocation);
    //then
    expect(specificCourtLocationCCD).toEqual(expected);
  });
});
