import {
  UnavailableDatePeriod,
  UnavailableDates,
  UnavailableDateType,
} from 'common/models/directionsQuestionnaire/hearing/unavailableDates';
import { getNumberOfUnavailableDays, getListOfUnavailableDate } from 'services/features/directionsQuestionnaire/hearing/unavailableDatesCalculation';

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
});
