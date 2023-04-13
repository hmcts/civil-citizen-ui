import {CCDWitnesses} from "models/ccdResponse/ccdWitnesses";
import {toCUIWitnesses} from "services/translation/convertToCUI/convertToCUIWitnesses";
import {YesNo, YesNoUpperCamelCase} from "form/models/yesNo";
import {Witnesses} from "models/directionsQuestionnaire/witnesses/witnesses";

describe('translate CCDWitnesses to CUI Witnesses model', () => {
  it('should return undefined if CCDWitnesses doesnt exist', () => {
    //Given
    const input: CCDWitnesses = undefined;
    //When
    const output = toCUIWitnesses(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return undefined if witness appear is undefined', () => {
    //Given
    const input: CCDWitnesses  = {
      witnessesToAppear: undefined
    };
    //When
    const output = toCUIWitnesses(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return undefined if witness details is undefined', () => {
    //Given
    const input: CCDWitnesses  = {
      witnessesToAppear: YesNoUpperCamelCase.NO,
      details: undefined
    };
    //When
    const output = toCUIWitnesses(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return empty if witness details is empty', () => {
    //Given
    const input: CCDWitnesses = {
      witnessesToAppear: YesNoUpperCamelCase.NO,
      details: []
    };
    //When
    const output = toCUIWitnesses(input);
    const expected : Witnesses = {
      otherWitnesses: {
        option: YesNo.NO,
        witnessItems: []
      }
    }
    //Then
    expect(output).toEqual(expected);
  });

  it('should return undefined if witness details data is undefined', () => {
    //Given
    const input: CCDWitnesses = {
      witnessesToAppear: YesNoUpperCamelCase.NO,
      details: [
        {
          value: undefined
        }
      ]
    };
    //When
    const output = toCUIWitnesses(input);
    const expected : Witnesses = {
      otherWitnesses: {
        option: YesNo.NO,
        witnessItems: [
          {
            firstName: undefined,
            lastName: undefined,
            email: undefined,
            telephone: undefined,
            details: undefined,
          }
        ]
      }
    }
    //Then
    expect(output).toEqual(expected);
  });

  it('should return data if witness details data is exist', () => {
    //Given
    const input: CCDWitnesses = {
      witnessesToAppear: YesNoUpperCamelCase.NO,
      details: [
        {
          value: {
            name: 'first last',
            firstName: 'first',
            lastName: 'last',
            emailAddress: 'email',
            phoneNumber: '012345678',
            reasonForWitness: 'test',
          }
        }
      ]
    };
    //When
    const output = toCUIWitnesses(input);
    const expected : Witnesses = {
      otherWitnesses: {
        option: YesNo.NO,
        witnessItems: [
          {
            firstName: 'first',
            lastName: 'last',
            email: 'email',
            telephone: '012345678',
            details: 'test',
          }
        ]
      }
    }
    //Then
    expect(output).toEqual(expected);
  });
});
