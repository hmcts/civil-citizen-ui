import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {CURRENT_DAY, CURRENT_MONTH, CURRENT_YEAR} from '../../../../utils/dateUtils';
import {
  UnavailableDatePeriodGaHearing,
  UnavailableDatesGaHearing
} from 'models/generalApplication/unavailableDatesGaHearing';
import {getUnavailableDatesForHearingForm} from 'services/features/generalApplication/unavailableHearingDatesService';

describe('Unavailable Dates For Mediation Service', () => {
  const NOW = new Date();

  it('should return UnavailableDatesGaHearing when is a single date', async () => {
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
    const unavailableDatePeriodGaHearing = new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE, mockItem.single.start);

    const unavailableDatesMediationExpect = new UnavailableDatesGaHearing();
    unavailableDatesMediationExpect.items = [unavailableDatePeriodGaHearing];

    //When
    const result = getUnavailableDatesForHearingForm(mockRequest as Record<string, []>);
    //Then
    expect(result).toStrictEqual(unavailableDatesMediationExpect);
  });

  it('should return UnavailableDatesGaHearing when is a long period date', async () => {
    //given
    const currentDatePlusOne = new Date();
    currentDatePlusOne.setDate(currentDatePlusOne.getDate() + 1);
    const mockRequest: Record<string, any[]> = {
      'items': [{
        'type': UnavailableDateType.LONGER_PERIOD,
        'period': {
          'start': {'day': CURRENT_DAY, 'month': CURRENT_MONTH, 'year': CURRENT_YEAR},
          'end': {'day': currentDatePlusOne.getDay(), 'month': currentDatePlusOne.getMonth() + 1, 'year': currentDatePlusOne.getFullYear()},
        },
      }],
    };
    const mockItem =  mockRequest['items'][0];
    const unavailableDatePeriodGaHearing = new UnavailableDatePeriodGaHearing(UnavailableDateType.LONGER_PERIOD, mockItem.period.start, mockItem.period.end);

    const unavailableDatesHearingExpect = new UnavailableDatesGaHearing();
    unavailableDatesHearingExpect.items = [unavailableDatePeriodGaHearing];

    //When
    const result = getUnavailableDatesForHearingForm(mockRequest as Record<string, []>);
    //Then
    expect(result).toStrictEqual(unavailableDatesHearingExpect);
  });

  it('should return UnavailableDatesGaHearing when without specific UnavailableDateType set', async () => {
    //given
    const mockRequest: Record<string, any[]> = {
      'items': [{
        'single': {
          'start': {'day': NOW.getDate(), 'month': NOW.getMonth(), 'year': NOW.getFullYear()},
        },
      }],
    };
    const unavailableDatePeriodGaHearing = new UnavailableDatePeriodGaHearing();

    const unavailableDatesGaHearingExpect = new UnavailableDatesGaHearing();
    unavailableDatesGaHearingExpect.items = [unavailableDatePeriodGaHearing];

    //When
    const result = getUnavailableDatesForHearingForm(mockRequest as Record<string, []>);
    //Then
    expect(result).toStrictEqual(unavailableDatesGaHearingExpect);
  });

});
