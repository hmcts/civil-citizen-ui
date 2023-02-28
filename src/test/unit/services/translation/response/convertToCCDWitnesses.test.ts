import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {CCDWitnesses} from 'models/ccdResponse/ccdWitnesses';
import {Witnesses} from 'models/directionsQuestionnaire/witnesses/witnesses';
import {toCCDWitnesses} from 'services/translation/response/convertToCCDWitnesses';
import {OtherWitnesses} from 'models/directionsQuestionnaire/witnesses/otherWitnesses';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {OtherWitnessItems} from 'models/directionsQuestionnaire/witnesses/otherWitnessItems';

const witness1 =  new OtherWitnessItems({
  firstName: 'Joe',
  lastName: 'Doe',
  telephone: '000000000',
  email: 'joe@doe.com',
  details: 'Here is some of details',
});

const witness2 =  new OtherWitnessItems({
  firstName: 'Jane',
  lastName: 'Does',
  telephone: '111111111',
  email: 'jane@does.com',
  details: 'Some details of Jane Does',
});

describe('translate witnesses details to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  claim.directionQuestionnaire.hearing = new Hearing();
  claim.directionQuestionnaire.witnesses = new Witnesses();

  it('should return undefined if data doesnt exist', () => {
    //given
    const expected: CCDWitnesses = {
      witnessesToAppear: undefined,
      details: undefined,
    };

    //When
    const witnessesDetails = toCCDWitnesses(claim.directionQuestionnaire.witnesses);
    //then
    expect(witnessesDetails).toEqual(expected);
  });

  it('should return witness details if data exist', () => {
    //given
    const expected: CCDWitnesses = {
      witnessesToAppear: YesNoUpperCamelCase.YES,
      details: [{
        value: {
          name: witness1.firstName,
          firstName: witness1.firstName,
          lastName: witness1.lastName,
          emailAddress: witness1.email,
          phoneNumber: witness1.telephone,
          reasonForWitness: witness1.details,
        },
      },{
        value: {
          name: witness2.firstName,
          firstName: witness2.firstName,
          lastName: witness2.lastName,
          emailAddress: witness2.email,
          phoneNumber: witness2.telephone,
          reasonForWitness: witness2.details,
        },
      }],
    };
    claim.directionQuestionnaire.witnesses.otherWitnesses = new OtherWitnesses();
    claim.directionQuestionnaire.witnesses.otherWitnesses.option = YesNo.YES;
    claim.directionQuestionnaire.witnesses.otherWitnesses.witnessItems = [witness1, witness2];

    //When
    const witnessesDetails = toCCDWitnesses(claim.directionQuestionnaire.witnesses);
    //then
    expect(witnessesDetails).toEqual(expected);
  });
});
