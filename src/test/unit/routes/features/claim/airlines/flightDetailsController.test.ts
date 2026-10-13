import {Response} from 'express';
import flightDetailsController from '../../../../../../main/routes/features/claim/airlines/flightDetailsController';
import {CLAIM_DEFENDANT_COMPANY_DETAILS_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {FlightDetails} from 'common/models/flightDetails';
import {buildDataList, getFlightDetails, saveFlightDetails} from 'services/features/claim/delayedFlightService';
import {CivilServiceClient} from 'client/civilServiceClient';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/delayedFlightService', () => ({
  getFlightDetails: jest.fn(),
  saveFlightDetails: jest.fn(),
  buildDataList: jest.fn(() => ''),
}));

describe('Flight details Controller', () => {
  const getHandler = getRouteHandler(flightDetailsController, 'get');
  const postHandler = getRouteHandler(flightDetailsController, 'post');
  const viewPath = 'features/claim/airlines/flight-details';
  const pageTitle = 'PAGES.FLIGHT_DETAILS.FLIGHT_DETAILS';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetFlightDetails = getFlightDetails as jest.Mock;
  const mockSaveFlightDetails = saveFlightDetails as jest.Mock;
  const mockBuildDataList = buildDataList as jest.Mock;
  const airlines = [
    {airline: 'airline 1', epimsID: '1'},
    {airline: 'airline 2', epimsID: '2'},
  ];

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetFlightDetails.mockResolvedValue(new FlightDetails());
    mockSaveFlightDetails.mockResolvedValue(undefined);
    mockBuildDataList.mockReturnValue('');
    jest.spyOn(CivilServiceClient.prototype, 'getAirlines').mockResolvedValue(airlines);
  });

  describe('on GET', () => {
    it('should render flight details', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
        airlines,
      }));
    });

    it('should call next when loading flight details fails', async () => {
      const error = new Error('error');
      mockGetFlightDetails.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect when flight details are valid', async () => {
      req.body = {
        airline: 'Ryanair',
        flightNumber: '121314',
        year: '2023',
        month: '9',
        day: '29',
      };

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveFlightDetails).toHaveBeenCalledWith('user-id', expect.any(FlightDetails));
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_DEFENDANT_COMPANY_DETAILS_URL);
    });

    it('should re-render when inputs are empty', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
      const form = (res.render as jest.Mock).mock.calls[0][1].form as GenericForm<FlightDetails>;
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('airline')).toBe('ERRORS.FLIGHT_DETAILS.AIRLINE_REQUIRED');
      expect(form.errorFor('flightNumber')).toBe('ERRORS.FLIGHT_DETAILS.FLIGHT_NUMBER_REQUIRED');
      expect(form.errorFor('year')).toBe('ERRORS.VALID_YEAR');
      expect(form.errorFor('month')).toBe('ERRORS.VALID_MONTH');
      expect(form.errorFor('day')).toBe('ERRORS.VALID_DAY');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next when saving flight details fails', async () => {
      const error = new Error('error');
      mockGetFlightDetails.mockRejectedValue(error);
      jest.spyOn(CivilServiceClient.prototype, 'getAirlines').mockRejectedValue(error);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
