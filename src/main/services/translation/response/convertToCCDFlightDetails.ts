import {CCDFlightDelayDetails} from 'common/models/airlines/flights';
import {FlightDetails} from 'common/models/flightDetails';
import {DateTime} from 'luxon';

export const toCCDFlightDetails = (flightDetails: FlightDetails = new FlightDetails()): CCDFlightDelayDetails => {
  return {
    nameOfAirline: flightDetails.airline,
    flightNumber: flightDetails.flightNumber,
    scheduledDate: flightDetails.flightDate ? DateTime.fromJSDate(new Date(flightDetails.flightDate)).toFormat('yyyy-MM-dd') : undefined,
  };
};
