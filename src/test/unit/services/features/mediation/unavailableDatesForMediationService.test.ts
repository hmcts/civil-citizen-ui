import {getUnavailableDatesMediationForm} from 'services/features/mediation/unavailableDatesForMediationService';
import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {UnavailableDatePeriodMediation, UnavailableDatesMediation} from 'models/mediation/unavailableDatesMediation';

describe('Unavailable DatesFor Mediation Service', () => {
  const NOW = new Date();

  it('should return UnavailableDatesMediation when is a single date', async () => {
    //given
    const mockRequest: Record<string, any[]> = {
      'items': [{
        'type': UnavailableDateType.SINGLE_DATE,
        'single': {
          'start': {'day': NOW.getDay(), 'month': NOW.getMonth(), 'year': NOW.getFullYear()},
        },
      }],
    };

    const mockItem =  mockRequest['items'][0];
    const unavailableDatePeriodMediation = new UnavailableDatePeriodMediation(UnavailableDateType.SINGLE_DATE, mockItem.single.start);

    const unavailableDatesMediationExpect = new UnavailableDatesMediation();
    unavailableDatesMediationExpect.items = [unavailableDatePeriodMediation];

    //When
    const result = getUnavailableDatesMediationForm(mockRequest as Record<string, []>);
    //Then
    expect(result).toStrictEqual(unavailableDatesMediationExpect);
  });

  it('should return UnavailableDatesMediation when is a long period date', async () => {
    //given
    const DAY_PLUS_1 = NOW.getDay() + 1;
    const mockRequest: Record<string, any[]> = {
      'items': [{
        'type': UnavailableDateType.LONGER_PERIOD,
        'period': {
          'start': {'day': NOW.getDay(), 'month': NOW.getMonth(), 'year': NOW.getFullYear()},
          'end': {'day': DAY_PLUS_1, 'month': NOW.getMonth(), 'year': NOW.getFullYear()},
        },
      }],
    };
    const mockItem =  mockRequest['items'][0];
    const unavailableDatePeriodMediation = new UnavailableDatePeriodMediation(UnavailableDateType.LONGER_PERIOD, mockItem.period.start, mockItem.period.end);

    const unavailableDatesMediationExpect = new UnavailableDatesMediation();
    unavailableDatesMediationExpect.items = [unavailableDatePeriodMediation];

    //When
    const result = getUnavailableDatesMediationForm(mockRequest as Record<string, []>);
    //Then
    expect(result).toStrictEqual(unavailableDatesMediationExpect);
  });

  it('should return UnavailableDatesMediation when without specific UnavailableDateType set', async () => {
    //given
    const mockRequest: Record<string, any[]> = {
      'items': [{
        'single': {
          'start': {'day': NOW.getDay(), 'month': NOW.getMonth(), 'year': NOW.getFullYear()},
        },
      }],
    };
    const unavailableDatePeriodMediation = new UnavailableDatePeriodMediation();

    const unavailableDatesMediationExpect = new UnavailableDatesMediation();
    unavailableDatesMediationExpect.items = [unavailableDatePeriodMediation];

    //When
    const result = getUnavailableDatesMediationForm(mockRequest as Record<string, []>);
    //Then
    expect(result).toStrictEqual(unavailableDatesMediationExpect);
  });

});
