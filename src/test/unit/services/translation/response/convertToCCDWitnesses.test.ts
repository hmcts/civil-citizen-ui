import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {CCDWitnesses} from 'models/ccdResponse/ccdWitnesses';
import {Witnesses} from 'models/directionsQuestionnaire/witnesses/witnesses';
import {toCCDWitnesses} from 'services/translation/response/convertToCCDWitnesses';

describe('translate Welsh Language requirement to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  claim.directionQuestionnaire.hearing = new Hearing();
  claim.directionQuestionnaire.witnesses = new Witnesses();

  it('should return undefined if items doesnt exist', () => {
    //given
    const expected: CCDWitnesses = {
      witnessesToAppear: undefined,
      details: undefined,
    };

    //When
    const specificCourtLocationCCD = toCCDWitnesses(claim.directionQuestionnaire.witnesses);
    //then
    expect(specificCourtLocationCCD).toEqual(expected);
  });
});
