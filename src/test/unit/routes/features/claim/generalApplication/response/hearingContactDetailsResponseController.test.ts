import {Response} from 'express';
import hearingContactDetailsResponseController from '../../../../../../../main/routes/features/generalApplication/response/hearingContactDetailsResponseController';
import {GA_UNAVAILABILITY_RESPONSE_CONFIRMATION_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as gaStoreResponseService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService');
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));

describe('General Application Response - Contact Details', () => {
  const getHandler = getRouteHandler(hearingContactDetailsResponseController, 'get');
  const postHandler = getRouteHandler(hearingContactDetailsResponseController, 'post');
  const viewPath = 'features/generalApplication/hearing-contact-details';
  const claimId = '12345';
  const appId = 'GA-1001';
  let req: {params: {id: string; appId: string}; body: Record<string, unknown>; cookies: {lang: string}; query: Record<string, unknown>};
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let gaResponse: GaResponse;
  const mockGetClaim = getClaimById as jest.Mock;
  const mockGetDraft = gaStoreResponseService.getDraftGARespondentResponse as jest.Mock;
  const mockSaveDraft = gaStoreResponseService.saveDraftGARespondentResponse as jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {params: {id: claimId, appId}, body: {}, cookies: {lang: 'en'}, query: {}};
    res = createMockResponse();
    next = jest.fn();
    gaResponse = new GaResponse();
    gaResponse.generalApplicationType = [ApplicationTypeOption.ADJOURN_HEARING];
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(buildClaim());
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    mockGetClaim.mockResolvedValue(buildClaim());
    mockGetDraft.mockResolvedValue(gaResponse);
    mockSaveDraft.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the contact details page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        form: expect.anything(),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaim.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should save and redirect when a telephone number and email are provided', async () => {
      req.body = {telephoneNumber: '04432188664', emailAddress: 'test@gmail.com'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(gaResponse.hearingContactDetails?.telephoneNumber).toBe('04432188664');
      expect(gaResponse.hearingContactDetails?.emailAddress).toBe('test@gmail.com');
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_UNAVAILABILITY_RESPONSE_CONFIRMATION_URL),
      );
    });

    it('should re-render when the telephone number and email are missing', async () => {
      req.body = {telephoneNumber: null, emailAddress: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraft).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraft.mockRejectedValue(error);
      req.body = {telephoneNumber: '04432188664', emailAddress: 'test@gmail.com'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
