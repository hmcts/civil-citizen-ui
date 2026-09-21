import {Response} from 'express';
import delayedFlightController from '../../../../../../main/routes/features/claim/airlines/delayedFlightController';
import {CLAIM_DEFENDANT_COMPANY_DETAILS_URL, FLIGHT_DETAILS_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {getDelayedFlight, saveDelayedFlight} from 'services/features/claim/delayedFlightService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/claim/delayedFlightService', () => ({
  getDelayedFlight: jest.fn(),
  saveDelayedFlight: jest.fn(),
}));

describe('Delayed flight Controller', () => {
  const getHandler = getRouteHandler(delayedFlightController, 'get');
  const postHandler = getRouteHandler(delayedFlightController, 'post');
  const viewPath = 'features/claim/airlines/delayed-flight';
  const pageTitle = 'PAGES.DELAYED_FLIGHT.CLAIMING_FOR_DELAYED';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetDelayedFlight = getDelayedFlight as jest.Mock;
  const mockSaveDelayedFlight = saveDelayedFlight as jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetDelayedFlight.mockResolvedValue(new GenericYesNo());
    mockSaveDelayedFlight.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render delayed flight', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
    });

    it('should call next when loading delayed flight fails', async () => {
      const error = new Error('error');
      mockGetDelayedFlight.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to flight details when Yes is selected', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveDelayedFlight).toHaveBeenCalledWith('user-id', expect.any(GenericYesNo));
      expect(res.redirect).toHaveBeenCalledWith(FLIGHT_DETAILS_URL);
    });

    it('should redirect to defendant company details when No is selected', async () => {
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIM_DEFENDANT_COMPANY_DETAILS_URL);
    });

    it('should re-render when no option is selected', async () => {
      req.body = {option: null};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle,
        form: expect.any(GenericForm),
      }));
      const form = (res.render as jest.Mock).mock.calls[0][1].form as GenericForm<GenericYesNo>;
      expect(form.hasErrors()).toBe(true);
      expect(form.errorFor('option')).toBe('ERRORS.DELAYED_FLIGHT.CLAIMING_FOR_DELAY_REQUIRED');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next when saving delayed flight fails', async () => {
      const error = new Error('error');
      mockSaveDelayedFlight.mockRejectedValue(error);
      req.body = {option: YesNo.NO};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
