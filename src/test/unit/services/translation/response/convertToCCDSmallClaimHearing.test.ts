import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {CCDSmallClaimHearing, CCDUnavailableDateType} from 'models/ccdResponse/ccdSmallClaimHearing';
import {toCCDSmallClaimHearing} from 'services/translation/response/convertToCCDSmallClaimHearing';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {
  UnavailableDatePeriod, UnavailableDates,
  UnavailableDateType,
} from 'models/directionsQuestionnaire/hearing/unavailableDates';

const singleDateMock: UnavailableDatePeriod = {
  from: new Date('2024-01-01T00:00:00.000Z'),
  startYear: 2024,
  startMonth: 1,
  startDay: 1,
  endYear: null,
  endMonth: null,
  endDay: null,
  type: UnavailableDateType.SINGLE_DATE,
};

const longerPeriod10DaysMock: UnavailableDatePeriod = {
  from: new Date('2024-01-10T00:00:00.000Z'),
  until: new Date('2024-01-20T00:00:00.000Z'),
  startYear: 2024,
  startMonth: 2,
  startDay: 2,
  endYear: 2024,
  endMonth: 2,
  endDay: 5,
  type: UnavailableDateType.LONGER_PERIOD,
};

describe('translate small claim hearing details to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  claim.directionQuestionnaire.hearing = new Hearing();

  it('should return undefined if items doesnt exist', () => {
    //given
    const expected: CCDSmallClaimHearing = {
      unavailableDatesRequired: undefined,
      smallClaimUnavailableDate: undefined,
    };

    //When
    const smallClaimHearing = toCCDSmallClaimHearing(claim.directionQuestionnaire.hearing);
    //then
    expect(smallClaimHearing).toEqual(expected);
  });

  it('should return values if data exists , for single date', () => {
    //given

    const expected: CCDSmallClaimHearing = {
      unavailableDatesRequired: undefined,
      smallClaimUnavailableDate: undefined,
    };

    //When
    const smallClaimHearing = toCCDSmallClaimHearing(claim.directionQuestionnaire.hearing);
    //then
    expect(smallClaimHearing).toEqual(expected);
  });

  it('should return output if cant attend hearing for next 12 month set to no', () => {
    //given
    claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option: YesNo.NO};

    const expected: CCDSmallClaimHearing = {
      unavailableDatesRequired: YesNoUpperCamelCase.NO,
      smallClaimUnavailableDate: undefined,
    };

    //When
    const smallClaimHearing = toCCDSmallClaimHearing(claim.directionQuestionnaire.hearing);
    //then
    expect(smallClaimHearing).toEqual(expected);
  });

  it('should return output if cant attend hearing for next 12 month set to Yes and unavailable for single day', () => {
    //given
    claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option: YesNo.YES};
    claim.directionQuestionnaire.hearing.unavailableDatesForHearing =  new UnavailableDates();
    claim.directionQuestionnaire.hearing.unavailableDatesForHearing.items = [singleDateMock];

    const expected: CCDSmallClaimHearing = {
      unavailableDatesRequired: YesNoUpperCamelCase.YES,
      smallClaimUnavailableDate: [{
        value: {
          date: singleDateMock.from,
          fromDate: singleDateMock.from,
          toDate: singleDateMock.until,
          unavailableDateType: CCDUnavailableDateType.SINGLE_DATE,
          who: undefined,
        },
      }],
    };

    //When
    const smallClaimHearing = toCCDSmallClaimHearing(claim.directionQuestionnaire.hearing);
    //then
    expect(smallClaimHearing).toEqual(expected);
  });

  it('should return output if cant attend hearing for next 12 month set to Yes and unavailable for longer period.', () => {
    //given
    claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option: YesNo.YES};
    claim.directionQuestionnaire.hearing.unavailableDatesForHearing =  new UnavailableDates();
    claim.directionQuestionnaire.hearing.unavailableDatesForHearing.items = [longerPeriod10DaysMock];

    const expected: CCDSmallClaimHearing = {
      unavailableDatesRequired: YesNoUpperCamelCase.YES,
      smallClaimUnavailableDate: [{
        value: {
          date: longerPeriod10DaysMock.from,
          fromDate: longerPeriod10DaysMock.from,
          toDate: longerPeriod10DaysMock.until,
          unavailableDateType: CCDUnavailableDateType.DATE_RANGE,
          who: undefined,
        },
      }],
    };

    //When
    const smallClaimHearing = toCCDSmallClaimHearing(claim.directionQuestionnaire.hearing);
    //then
    expect(smallClaimHearing).toEqual(expected);
  });
});
