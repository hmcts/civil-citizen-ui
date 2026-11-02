import {
  UnavailableDatePeriod,
  UnavailableDates,
  UnavailableDateType,
} from 'common/models/directionsQuestionnaire/hearing/unavailableDates';
import { getNumberOfUnavailableDays, getListOfUnavailableDate } from 'services/features/directionsQuestionnaire/hearing/unavailableDatesCalculation';

jest.mock('@hmcts/nodejs-logging', () => {
  const logger = {warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn()};
  return {Logger: {getLogger: () => logger}};
});
const mockLogger = require('@hmcts/nodejs-logging').Logger.getLogger();

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

const longerPeriod5DaysOverlapMock: UnavailableDatePeriod = {
  from: new Date('2024-01-15T00:00:00.000Z'),
  until: new Date('2024-01-25T00:00:00.000Z'),
  startYear: 2024,
  startMonth: 2,
  startDay: 2,
  endYear: 2024,
  endMonth: 2,
  endDay: 5,
  type: UnavailableDateType.LONGER_PERIOD,
};

describe('unavailable dates calculation service test', () => {
  describe('getNumberOfUnavailableDays', () => {
    it('should return 1 unavailable day', async () => {
      //Given
      const unavailableDates: UnavailableDates = {
        items: [singleDateMock],
      };
      //When
      const result = getNumberOfUnavailableDays(unavailableDates);
      //Then
      expect(result).toBe(1);
    });
    it('should return 16 unavailable day with overlaps', async () => {
      //Given
      const unavailableDates: UnavailableDates = {
        items: [longerPeriod10DaysMock, longerPeriod5DaysOverlapMock],
      };
      //When
      const result = getNumberOfUnavailableDays(unavailableDates);
      //Then
      expect(result).toBe(16);
    });
    it('should return empty set when unavailableDates is undefined', () => {
      const result = getListOfUnavailableDate(undefined as any);
      expect(result.size).toBe(0);
    });
  });

  describe('getListOfUnavailableDate with missing or invalid dates', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should skip and warn when single date has no from date', () => {
      //Given
      const unavailableDates: UnavailableDates = {
        items: [{...singleDateMock, from: undefined}],
      };
      //When
      const result = getListOfUnavailableDate(unavailableDates);
      //Then
      expect(result.size).toBe(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[getListOfUnavailableDate] SINGLE_DATE item 0 has missing or invalid from date, skipping');
    });

    it('should skip and warn when single date has an invalid from date', () => {
      //Given
      const unavailableDates: UnavailableDates = {
        items: [{...singleDateMock, from: 'not-a-date' as unknown as Date}],
      };
      //When
      const result = getListOfUnavailableDate(unavailableDates);
      //Then
      expect(result.size).toBe(0);
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    });

    it('should skip and warn when longer period has no until date', () => {
      //Given
      const unavailableDates: UnavailableDates = {
        items: [{...longerPeriod10DaysMock, until: undefined}],
      };
      //When
      const result = getListOfUnavailableDate(unavailableDates);
      //Then
      expect(result.size).toBe(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[getListOfUnavailableDate] LONGER_PERIOD item 0 has missing or invalid from/until date, skipping');
    });

    it('should skip and warn when longer period has no from date', () => {
      //Given
      const unavailableDates: UnavailableDates = {
        items: [{...longerPeriod10DaysMock, from: undefined}],
      };
      //When
      const result = getListOfUnavailableDate(unavailableDates);
      //Then
      expect(result.size).toBe(0);
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
    });

    it('should keep valid items and only skip the invalid one', () => {
      //Given
      const unavailableDates: UnavailableDates = {
        items: [singleDateMock, {...longerPeriod10DaysMock, until: undefined}],
      };
      //When
      const result = getListOfUnavailableDate(unavailableDates);
      //Then
      expect(result.size).toBe(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        '[getListOfUnavailableDate] LONGER_PERIOD item 1 has missing or invalid from/until date, skipping');
    });

    it('should count deserialised ISO string dates without warning', () => {
      //Given
      const unavailableDates: UnavailableDates = {
        items: [
          {...singleDateMock, from: '2024-01-01T00:00:00.000Z' as unknown as Date},
          {
            ...longerPeriod10DaysMock,
            from: '2024-02-10T00:00:00.000Z' as unknown as Date,
            until: '2024-02-12T00:00:00.000Z' as unknown as Date,
          },
        ],
      };
      //When
      const result = getNumberOfUnavailableDays(unavailableDates);
      //Then
      expect(result).toBe(4);
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });
  });
});
