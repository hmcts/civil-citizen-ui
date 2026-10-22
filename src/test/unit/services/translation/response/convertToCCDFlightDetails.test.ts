import {toCCDFlightDetails} from 'services/translation/response/convertToCCDFlightDetails';
import {FlightDetails} from 'common/models/flightDetails';

describe('toCCDFlightDetails', () => {
  it('should return empty airline fields when flight details are defaulted', () => {
    expect(toCCDFlightDetails()).toEqual({
      nameOfAirline: undefined,
      flightNumber: undefined,
      scheduledDate: undefined,
    });
  });

  it('should translate flight details with a scheduled date', () => {
    const flightDetails = new FlightDetails('BA', 'BA123', '2024', '5', '1');
    expect(toCCDFlightDetails(flightDetails)).toEqual({
      nameOfAirline: 'BA',
      flightNumber: 'BA123',
      scheduledDate: '2024-05-01',
    });
  });

  it('should omit scheduledDate when flightDate is missing', () => {
    const flightDetails = new FlightDetails('EasyJet', 'EZY9');
    flightDetails.flightDate = undefined;
    expect(toCCDFlightDetails(flightDetails)).toEqual({
      nameOfAirline: 'EasyJet',
      flightNumber: 'EZY9',
      scheduledDate: undefined,
    });
  });
});
