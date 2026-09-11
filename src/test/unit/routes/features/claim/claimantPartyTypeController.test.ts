import {Response} from 'express';
import claimantPartyTypeController from '../../../../../main/routes/features/claim/yourDetails/claimantPartyTypeController';
import {PartyType} from 'models/partyType';
import {
  CLAIMANT_COMPANY_DETAILS_URL,
  CLAIMANT_INDIVIDUAL_DETAILS_URL,
  CLAIMANT_ORGANISATION_DETAILS_URL,
  CLAIMANT_SOLE_TRADER_DETAILS_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {Party} from 'models/party';
import {getClaimantInformation, saveClaimantProperty} from 'services/features/claim/yourDetails/claimantDetailsService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claim/yourDetails/claimantDetailsService', () => ({
  getClaimantInformation: jest.fn(),
  saveClaimantProperty: jest.fn(),
}));

describe('Claim Party Type Controller', () => {
  const getHandler = getRouteHandler(claimantPartyTypeController, 'get');
  const postHandler = getRouteHandler(claimantPartyTypeController, 'post');
  const viewPath = 'features/claim/claimant-party-type';
  const pageTitle = 'PAGES.CLAIMANT_PARTY_TYPE_SELECTION.PAGE_TITLE';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetClaimantInformation = getClaimantInformation as jest.Mock;
  const mockSaveClaimantProperty = saveClaimantProperty as jest.Mock;

  beforeEach(() => {
    req = {
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetClaimantInformation.mockResolvedValue(new Party());
    mockSaveClaimantProperty.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render claimant party type selection', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({pageTitle}));
      expect((res.render as jest.Mock).mock.calls[0][1].form).toBeInstanceOf(GenericForm);
    });

    it('should call next when loading claimant information fails', async () => {
      const error = new Error('error');
      mockGetClaimantInformation.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when claiming as is not selected', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({pageTitle, form: expect.any(GenericForm)}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to claimant individual details when An individual is selected', async () => {
      req.body = {option: PartyType.INDIVIDUAL};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveClaimantProperty).toHaveBeenCalledWith('user-id', 'type', PartyType.INDIVIDUAL);
      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_INDIVIDUAL_DETAILS_URL);
    });

    it('should redirect to sole trader details when sole trader is selected', async () => {
      req.body = {option: PartyType.SOLE_TRADER};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_SOLE_TRADER_DETAILS_URL);
    });

    it('should redirect to company details when limited company is selected', async () => {
      req.body = {option: PartyType.COMPANY};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_COMPANY_DETAILS_URL);
    });

    it('should redirect to organisation details when organisation is selected', async () => {
      req.body = {option: PartyType.ORGANISATION};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(CLAIMANT_ORGANISATION_DETAILS_URL);
    });

    it('should call next when save fails', async () => {
      const error = new Error('error');
      mockSaveClaimantProperty.mockRejectedValue(error);
      req.body = {option: PartyType.ORGANISATION};

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
