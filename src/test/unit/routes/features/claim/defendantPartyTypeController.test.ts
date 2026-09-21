import {Response} from 'express';
import defendantPartyTypeController from '../../../../../main/routes/features/claim/yourDetails/defendantPartyTypeController';
import {PartyType} from 'models/partyType';
import {
  DELAYED_FLIGHT_URL,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL,
  CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Party} from 'models/party';
import {getDefendantInformation, saveDefendantProperty} from 'services/features/common/defendantDetailsService';
import {deleteDelayedFlight} from 'services/features/claim/delayedFlightService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/common/defendantDetailsService', () => ({
  getDefendantInformation: jest.fn(),
  saveDefendantProperty: jest.fn(),
}));
jest.mock('services/features/claim/delayedFlightService', () => ({
  deleteDelayedFlight: jest.fn(),
}));

describe('Defendant party type controller', () => {
  const getHandler = getRouteHandler(defendantPartyTypeController, 'get');
  const postHandler = getRouteHandler(defendantPartyTypeController, 'post');
  const viewPath = 'features/claim/defendant-party-type';
  const pageTitle = 'PAGES.DEFENDANT_PARTY_TYPE.PAGE_TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetDefendantInformation = getDefendantInformation as jest.Mock;
  const mockSaveDefendantProperty = saveDefendantProperty as jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGetDefendantInformation.mockResolvedValue(new Party());
    mockSaveDefendantProperty.mockResolvedValue(undefined);
    (deleteDelayedFlight as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render defendant party type page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({pageTitle}));
      expect((res.render as jest.Mock).mock.calls[0][1].form).toBeInstanceOf(GenericForm);
    });

    it('should call next when loading defendant information fails', async () => {
      const error = new Error('error');
      mockGetDefendantInformation.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no selection is made', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({pageTitle, form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should redirect to individual details when individual is selected', async () => {
      req.body = {option: PartyType.INDIVIDUAL};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(deleteDelayedFlight).toHaveBeenCalledWith('user-id');
      expect(res.redirect).toHaveBeenCalledWith(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL);
    });

    it('should redirect to delayed flight when company is selected', async () => {
      req.body = {option: PartyType.COMPANY};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(deleteDelayedFlight).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(DELAYED_FLIGHT_URL);
    });

    it('should redirect to sole trader details when sole trader is selected', async () => {
      req.body = {option: PartyType.SOLE_TRADER};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL);
    });

    it('should redirect to organisation details when organisation is selected', async () => {
      req.body = {option: PartyType.ORGANISATION};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL);
    });

    it('should re-render when a non-existent party type is provided', async () => {
      req.body = {foo: 'blah'};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveDefendantProperty.mockRejectedValue(error);
      req.body = {option: PartyType.ORGANISATION};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
