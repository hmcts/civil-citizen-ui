import {CCDClaim} from 'models/civilClaimResponse';
import {CUISourceName, toCUIHearing} from 'services/translation/convertToCUI/convertToCUIHearing';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {CCDUnavailableDateType} from 'models/ccdResponse/ccdSmallClaimHearing';
import {GenericYesNo} from 'form/models/genericYesNo';
import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {CCDSupportRequirement} from 'models/ccdResponse/ccdHearingSupport';

describe('translate CCDHearing to CUI Hearing model', () => {
  it('should return undefined if ccdClaim doesnt exist', () => {
    //Given
    const input: CCDClaim = undefined;
    //When
    const output = toCUIHearing(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return empty object if data is undefined', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: undefined,
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: undefined,
    };
    //When
    const output = toCUIHearing(input);
    //Then
    expect(output).toEqual(new Hearing());
  });

  it('should return empty object if data is undefined', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: undefined,
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: {
        respondent1DQExtraDetails: undefined,
        respondent1DQHearingSupportLip: undefined,
      },
    };
    //When
    const output = toCUIHearing(input);
    //Then
    expect(output).toEqual(new Hearing());
  });

  it('should return empty object if data is undefined', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: undefined,
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: {
        respondent1DQExtraDetails: {
          whyUnavailableForHearing: undefined,
          wantPhoneOrVideoHearing: undefined,
        },
        respondent1DQHearingSupportLip: undefined,
      },
    };
    //When
    const output = toCUIHearing(input);
    //Then
    expect(output).toEqual(new Hearing());
  });

  it('should return data if data is exist for court location', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: {
        requestHearingAtSpecificCourt: YesNoUpperCamelCase.YES,
        caseLocation: {
          baseLocation: 'test',
        },
        reasonForHearingAtSpecificCourt: 'test',
      },
      respondent1DQHearingSmallClaim: undefined,
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: undefined,
    };
    //When
    const output = toCUIHearing(input);
    //Then
    const expected : Hearing = {
      specificCourtLocation : new SpecificCourtLocation( 'test', 'test'),
    };
    expect(output).toEqual(expected);
  });

  it('should return undefined if data is undefined for court location', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: {
        requestHearingAtSpecificCourt: undefined,
        caseLocation: undefined,
        reasonForHearingAtSpecificCourt: undefined,
      },
      respondent1DQHearingSmallClaim: undefined,
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: undefined,
    };
    //When
    const output = toCUIHearing(input);
    //Then
    const expected : Hearing = {
      specificCourtLocation : new SpecificCourtLocation(undefined, undefined),
    };
    expect(output).toEqual(expected);
  });

  it('should return data if data is exist for small claim', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: {
        smallClaimUnavailableDate: [
          {
            value: {
              who: 'test',
              date: new Date('2024-01-01T00:00:00.000Z'),
              fromDate: new Date('2024-01-01T00:00:00.000Z'),
              toDate: new Date('2024-01-02T00:00:00.000Z'),
              unavailableDateType: CCDUnavailableDateType.DATE_RANGE,
            },
          },
        ],
        unavailableDatesRequired: YesNoUpperCamelCase.YES,
      },
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: undefined,
    };
    //When
    const output = toCUIHearing(input);
    //Then
    const expected : Hearing = {
      unavailableDatesForHearing : {
        items: [
          {
            type: UnavailableDateType.LONGER_PERIOD,
            from: new Date('2024-01-01T00:00:00.000Z'),
            until: new Date('2024-01-02T00:00:00.000Z'),
          },
        ],
      },
      cantAttendHearingInNext12Months: new GenericYesNo(YesNo.YES),
    };
    expect(output).toEqual(expected);
  });

  it('should return data if data is exist for small claim single date', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: {
        smallClaimUnavailableDate: [
          {
            value: {
              who: 'test',
              date: new Date('2024-01-01T00:00:00.000Z'),
              fromDate: new Date('2024-01-01T00:00:00.000Z'),
              toDate: new Date('2024-01-01T00:00:00.000Z'),
              unavailableDateType: CCDUnavailableDateType.SINGLE_DATE,
            },
          },
        ],
        unavailableDatesRequired: YesNoUpperCamelCase.NO,
      },
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: undefined,
    };
    //When
    const output = toCUIHearing(input);
    //Then
    const expected : Hearing = {
      unavailableDatesForHearing : {
        items: [
          {
            type: UnavailableDateType.SINGLE_DATE,
            from: new Date('2024-01-01T00:00:00.000Z'),
            until: new Date('2024-01-01T00:00:00.000Z'),
          },
        ],
      },
      cantAttendHearingInNext12Months: new GenericYesNo(YesNo.NO),
    };
    expect(output).toEqual(expected);
  });

  it('should return undefined if data is undefined for small claim', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: {
        smallClaimUnavailableDate: [
          {
            value: {
              who: undefined,
              date: undefined,
              fromDate: undefined,
              toDate: undefined,
              unavailableDateType: undefined,
            },
          },
        ],
        unavailableDatesRequired: undefined,
      },
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: undefined,
    };
    //When
    const output = toCUIHearing(input);
    //Then
    const expected : Hearing = {
      unavailableDatesForHearing : {
        items: [
          {
            type: undefined,
            from: undefined,
            until: undefined,
          },
        ],
      },
      cantAttendHearingInNext12Months: undefined,
    };
    expect(output).toEqual(expected);
  });

  it('should return undefined if data is undefined for small claim', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: {
        smallClaimUnavailableDate: undefined,
        unavailableDatesRequired: undefined,
      },
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: undefined,
    };
    //When
    const output = toCUIHearing(input);
    //Then
    const expected : Hearing = {
      unavailableDatesForHearing : {
        items: undefined,
      },
      cantAttendHearingInNext12Months: undefined,
    };
    expect(output).toEqual(expected);
  });

  it('should return data if data is exist for fast claim', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: undefined,
      respondent1DQHearingFastClaim: {
        unavailableDates: [
          {
            value: {
              who: 'test',
              date: new Date('2024-01-01T00:00:00.000Z'),
              fromDate: new Date('2024-01-01T00:00:00.000Z'),
              toDate: new Date('2024-01-02T00:00:00.000Z'),
              unavailableDateType: CCDUnavailableDateType.DATE_RANGE,
            },
          },
        ],
        unavailableDatesRequired: YesNoUpperCamelCase.YES,
      },
      respondent1LiPResponse: undefined,
    };
    //When
    const output = toCUIHearing(input);
    //Then
    const expected : Hearing = {
      unavailableDatesForHearing : {
        items: [
          {
            type: UnavailableDateType.LONGER_PERIOD,
            from: new Date('2024-01-01T00:00:00.000Z'),
            until: new Date('2024-01-02T00:00:00.000Z'),
          },
        ],
      },
      cantAttendHearingInNext12Months: new GenericYesNo(YesNo.YES),
    };
    expect(output).toEqual(expected);
  });

  it('should return undefined if data is undefined for fast claim', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: undefined,
      respondent1DQHearingFastClaim: {
        unavailableDates: undefined,
        unavailableDatesRequired: undefined,
      },
      respondent1LiPResponse: undefined,
    };
    //When
    const output = toCUIHearing(input);
    //Then
    const expected : Hearing = {
      unavailableDatesForHearing : {
        items: undefined,
      },
      cantAttendHearingInNext12Months: undefined,
    };
    expect(output).toEqual(expected);
  });

  it('should return data if data is exist for why unavailable hearing', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: undefined,
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: {
        respondent1DQExtraDetails: {
          whyUnavailableForHearing: 'test',
        },
      },
    };
    //When
    const output = toCUIHearing(input);
    //Then
    const expected : Hearing = {
      whyUnavailableForHearing : {
        reason: 'test',
      },
    };
    expect(output).toEqual(expected);
  });

  it('should return data if data is exist for phone or video hearing', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: undefined,
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: {
        respondent1DQExtraDetails: {
          wantPhoneOrVideoHearing: YesNoUpperCamelCase.YES,
          whyPhoneOrVideoHearing: 'test',
        },
      },
    };
    //When
    const output = toCUIHearing(input);
    //Then
    const expected : Hearing = {
      phoneOrVideoHearing : {
        option: YesNo.YES,
        details: 'test',
      },
    };
    expect(output).toEqual(expected);
  });

  it('should return undefined if data is undefined for phone or video hearing', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: undefined,
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: {
        respondent1DQExtraDetails: {
          wantPhoneOrVideoHearing: undefined,
          whyPhoneOrVideoHearing: undefined,
        },
      },
    };
    //When
    const output = toCUIHearing(input);
    //Then
    expect(output).toEqual(new Hearing());
  });

  it('should return undefined if data is undefined for support list', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: undefined,
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: {
        respondent1DQHearingSupportLip: {
          supportRequirementLip: undefined,
          requirementsLip: undefined,
        },
      },
    };
    //When
    const output = toCUIHearing(input);
    const expected : Hearing = {
      supportRequiredList : {
        option: undefined,
        items: undefined,
      },
    };
    //Then
    expect(output).toEqual(expected);
  });

  it('should return data if data is exist for support list', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: undefined,
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: {
        respondent1DQHearingSupportLip: {
          supportRequirementLip: YesNoUpperCamelCase.YES,
          requirementsLip: [
            {
              value: {
                name: 'test',
                requirements : [
                  CCDSupportRequirement.DISABLED_ACCESS,
                  CCDSupportRequirement.HEARING_LOOPS,
                  CCDSupportRequirement.SIGN_INTERPRETER,
                  CCDSupportRequirement.LANGUAGE_INTERPRETER,
                  CCDSupportRequirement.OTHER_SUPPORT,
                ],
                signLanguageRequired: 'test',
                languageToBeInterpreted: 'test',
                otherSupport: 'test',
              },
            },
          ],
        },
      },
    };
    //When
    const output = toCUIHearing(input);
    const expected : Hearing = {
      supportRequiredList : {
        option: YesNo.YES,
        items: [
          {
            fullName: 'test',
            disabledAccess: {
              sourceName: CUISourceName.DISABLED_ACCESS,
              selected: true,
              content: undefined,
            },
            hearingLoop: {
              sourceName: CUISourceName.HEARING_LOOPS,
              selected: true,
              content: undefined,
            },
            signLanguageInterpreter: {
              sourceName: CUISourceName.SIGN_INTERPRETER,
              selected: true,
              content: 'test',
            },
            languageInterpreter: {
              sourceName: CUISourceName.LANGUAGE_INTERPRETER,
              selected: true,
              content: 'test',
            },
            otherSupport: {
              sourceName: CUISourceName.OTHER_SUPPORT,
              selected: true,
              content: 'test',
            },
            checkboxGrp: [true, true, true, true, true],

          },
        ],
      },
    };
    //Then
    expect(output).toEqual(expected);
  });

  it('should return undefined if data is undefined for support list', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: undefined,
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: {
        respondent1DQHearingSupportLip: {
          supportRequirementLip: YesNoUpperCamelCase.NO,
          requirementsLip: [
            {
              value: {
                name: undefined,
                requirements : [
                  undefined,
                ],
                signLanguageRequired: undefined,
                languageToBeInterpreted: undefined,
                otherSupport: undefined,
              },
            },
          ],
        },
      },
    };
    //When
    const output = toCUIHearing(input);
    const expected : Hearing = {
      supportRequiredList : {
        option: YesNo.NO,
        items: [
          {
            fullName: undefined,
            disabledAccess: undefined,
            hearingLoop: undefined,
            signLanguageInterpreter: undefined,
            languageInterpreter: undefined,
            otherSupport: undefined,
            checkboxGrp: [null, null, null, null, null],

          },
        ],
      },
    };
    //Then
    expect(output).toEqual(expected);
  });

  it('should return undefined if data is undefined for support list', () => {
    //Given
    const input: CCDClaim  = {
      respondent1DQRequestedCourt: undefined,
      respondent1DQHearingSmallClaim: undefined,
      respondent1DQHearingFastClaim: undefined,
      respondent1LiPResponse: {
        respondent1DQHearingSupportLip: {
          supportRequirementLip: undefined,
          requirementsLip: undefined,
        },
      },
    };
    //When
    const output = toCUIHearing(input);
    const expected : Hearing = {
      supportRequiredList : {
        option: undefined,
        items: undefined,
      },
    };
    //Then
    expect(output).toEqual(expected);
  });
});
