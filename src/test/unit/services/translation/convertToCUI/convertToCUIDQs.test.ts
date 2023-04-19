import {CCDClaim} from 'models/civilClaimResponse';
import {toCUIDQs} from 'services/translation/convertToCUI/convertToCUIDQs';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from 'form/models/genericYesNo';

describe('translate CCDDQ to CUI DQ model', () => {
  it('should return undefined if ccdClaim doesnt exist', () => {
    //Given
    const input: CCDClaim = undefined;
    //When
    const output = toCUIDQs(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if ccdClaim has data', () => {
    //Given
    const input: CCDClaim = {
      respondent1LiPResponse: {
        respondent1DQExtraDetails: {
          giveEvidenceYourSelf: YesNoUpperCamelCase.YES,
        },
      },
    };
    //When
    const output = toCUIDQs(input);
    const expected : DirectionQuestionnaire = new DirectionQuestionnaire(new GenericYesNo(YesNo.YES), new Hearing());
    //Then
    expect(output).toEqual(expected);
  });
});
