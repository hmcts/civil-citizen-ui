import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {CCDDQExtraDetails} from 'models/ccdResponse/ccdDQExtraDetails';
import {toCCDDQExtraDetails} from 'services/translation/response/convertToCCDDQExtraDetials';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';

describe('translate DQ extra details to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  claim.directionQuestionnaire.hearing = new Hearing();

  it('should return undefined if items doesnt exist', () => {
    //given
    const expected: CCDDQExtraDetails = {
      wantPhoneOrVideoHearing: undefined,
      whyPhoneOrVideoHearing: '',
      whyUnavailableForHearing: undefined,
      giveEvidenceYourSelf: undefined,
    };

    //When
    const dqExtraDetails = toCCDDQExtraDetails(claim.directionQuestionnaire);
    //then
    expect(dqExtraDetails).toEqual(expected);
  });

  it('should return values if items exist', () => {
    //given
    claim.directionQuestionnaire.hearing = {
      phoneOrVideoHearing:{
        option: YesNo.YES,
        details: 'Need Phone hearing',
      },
      whyUnavailableForHearing:{
        reason: 'out of city',
      },
    };

    claim.directionQuestionnaire.defendantYourselfEvidence = {option: YesNo.YES};

    const expected: CCDDQExtraDetails = {
      wantPhoneOrVideoHearing: YesNoUpperCamelCase.YES,
      whyPhoneOrVideoHearing: 'Need Phone hearing',
      whyUnavailableForHearing: 'out of city',
      giveEvidenceYourSelf: YesNoUpperCamelCase.YES,
    };

    //When
    const dqExtraDetails = toCCDDQExtraDetails(claim.directionQuestionnaire);
    //then
    expect(dqExtraDetails).toEqual(expected);
  });
});
