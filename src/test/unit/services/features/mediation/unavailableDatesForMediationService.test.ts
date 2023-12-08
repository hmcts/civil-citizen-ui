import {getUnavailableDatesMediationForm} from 'services/features/mediation/unavailableDatesForMediationService';
import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {UnavailableDatePeriodMediation, UnavailableDatesMediation} from 'models/mediation/unavailableDatesMediation';
import {CURRENT_DAY, CURRENT_DAY_PLUS_1, CURRENT_MONTH, CURRENT_YEAR} from '../../../../utils/dateUtils';

describe('Unavailable Dates For Mediation Service', () => {
  const NOW = new Date();

  it('should return UnavailableDatesMediation when is a single date', async () => {
    //given
    const mockRequest: Record<string, any[]> = {
      'items': [{
        'type': UnavailableDateType.SINGLE_DATE,
        'single': {
          'start': {'day': CURRENT_DAY, 'month': CURRENT_MONTH, 'year': CURRENT_YEAR},
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
    const mockRequest: Record<string, any[]> = {
      'items': [{
        'type': UnavailableDateType.LONGER_PERIOD,
        'period': {
          'start': {'day': CURRENT_DAY, 'month': CURRENT_MONTH, 'year': CURRENT_YEAR},
          'end': {'day': CURRENT_DAY_PLUS_1, 'month': CURRENT_MONTH, 'year': CURRENT_YEAR},
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
          'start': {'day': NOW.getDate(), 'month': NOW.getMonth(), 'year': NOW.getFullYear()},
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

afterAll(() => {
  global.gc && global.gc();
});
