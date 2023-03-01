import {Claim} from 'models/claim';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';
import {CCDUnavailableDateType} from 'models/ccdResponse/ccdSmallClaimHearing';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {
  UnavailableDatePeriod,
  UnavailableDates,
  UnavailableDateType,
} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {CCDFastClaimHearing} from 'models/ccdResponse/ccdFastClaimHearing';
import {toCCDFastClaimHearing} from 'services/translation/response/convertToCCDFastClaimHearing';

const singleDateMock: UnavailableDatePeriod = {
  from: new Date('2023-03-11T00:00:00.000Z'),
  startYear: 2023,
  startMonth: 3,
  startDay: 11,
  endYear: null,
  endMonth: null,
  endDay: null,
  type: UnavailableDateType.SINGLE_DATE,
};

const longerPeriod10DaysMock: UnavailableDatePeriod = {
  from: new Date('2023-03-11T00:00:00.000Z'),
  until: new Date('2023-03-29T00:00:00.000Z'),
  startYear: 2023,
  startMonth: 3,
  startDay: 11,
  endYear: 2023,
  endMonth: 3,
  endDay: 29,
  type: UnavailableDateType.LONGER_PERIOD,
};

describe('translate Fast claim hearing details to CCD model', () => {
  const claim = new Claim();
  claim.directionQuestionnaire = new DirectionQuestionnaire();
  claim.directionQuestionnaire.hearing = new Hearing();

  it('should return undefined if items doesnt exist', () => {
    //given
    const expected: CCDFastClaimHearing = {
      hearingLength: undefined,
      hearingLengthHours: '3',
      hearingLengthDays: '1',
      unavailableDatesRequired: undefined,
      unavailableDates: undefined,
    };

    //When
    const FastClaimHearing = toCCDFastClaimHearing(claim.directionQuestionnaire.hearing);
    //then
    expect(FastClaimHearing).toMatchObject(expected);
  });

  it('when cant attend hearing for next 12 month set to no', () => {
    //given
    claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option: YesNo.NO};

    const expected: CCDFastClaimHearing = {
      hearingLength: undefined,
      hearingLengthHours: '3',
      hearingLengthDays: '1',
      unavailableDatesRequired: YesNoUpperCamelCase.NO,
      unavailableDates: undefined,
    };

    //When
    const FastClaimHearing = toCCDFastClaimHearing(claim.directionQuestionnaire.hearing);
    //then
    expect(FastClaimHearing).toEqual(expected);
  });

  it('when cant attend hearing for next 12 month set to Yes and unavailable for single day', () => {
    //given
    claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option: YesNo.YES};
    claim.directionQuestionnaire.hearing.unavailableDatesForHearing =  new UnavailableDates();
    claim.directionQuestionnaire.hearing.unavailableDatesForHearing.items = [singleDateMock];

    const expected: CCDFastClaimHearing = {
      hearingLength: undefined,
      hearingLengthHours: '3',
      hearingLengthDays: '1',
      unavailableDatesRequired: YesNoUpperCamelCase.YES,
      unavailableDates: [{
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
    const FastClaimHearing = toCCDFastClaimHearing(claim.directionQuestionnaire.hearing);
    //then
    expect(FastClaimHearing).toEqual(expected);
  });

  it('when cant attend hearing for next 12 month set to Yes and unavailable for longer period.', () => {
    //given
    claim.directionQuestionnaire.hearing.cantAttendHearingInNext12Months = {option: YesNo.YES};
    claim.directionQuestionnaire.hearing.unavailableDatesForHearing =  new UnavailableDates();
    claim.directionQuestionnaire.hearing.unavailableDatesForHearing.items = [longerPeriod10DaysMock];

    const expected: CCDFastClaimHearing = {
      hearingLength: undefined,
      hearingLengthHours: '3',
      hearingLengthDays: '1',
      unavailableDatesRequired: YesNoUpperCamelCase.YES,
      unavailableDates: [{
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
    const FastClaimHearing = toCCDFastClaimHearing(claim.directionQuestionnaire.hearing);
    //then
    expect(FastClaimHearing).toEqual(expected);
  });
});
