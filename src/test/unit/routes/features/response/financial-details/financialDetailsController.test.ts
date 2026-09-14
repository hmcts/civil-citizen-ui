import {Response} from 'express';
import financialDetailsController, {
  setFinancialDetailsControllerLogger,
} from '../../../../../../main/routes/features/response/financialDetails/financialDetailsController';
import {CITIZEN_BANK_ACCOUNT_URL, CITIZEN_CONTACT_THEM_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {LoggerInstance} from 'winston';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

const mockLogger = {
  error: jest.fn().mockImplementation((message: string) => message),
  info: jest.fn().mockImplementation((message: string) => message),
} as unknown as LoggerInstance;

describe('Citizen financial details', () => {
  const getHandler = getRouteHandler(financialDetailsController, 'get');
  const postHandler = getRouteHandler(financialDetailsController, 'post');
  const viewPath = 'features/response/financialDetails/financial-details';
  const claimId = '1646818997929180';
  let req: Partial<AppRequest>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = saveDraftClaim as jest.Mock;

  const claimWithType = (type?: PartyType): Claim => {
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.type = type;
    return claim;
  };

  beforeAll(() => {
    setFinancialDetailsControllerLogger(mockLogger);
  });

  beforeEach(() => {
    req = {
      params: {id: claimId},
      session: createMockSession({user: {id: 'user-id'}}),
      body: {},
      query: {},
      cookies: {},
    };
    res = createMockResponse();
    next = jest.fn();
    mockGetCaseData.mockResolvedValue(claimWithType(PartyType.INDIVIDUAL));
    mockSaveDraftClaim.mockResolvedValue(undefined);
    (mockLogger.error as jest.Mock).mockClear();
  });

  describe('on GET', () => {
    it('should render individual financial details page', async () => {
      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claim: expect.objectContaining({
          respondent1: expect.objectContaining({type: PartyType.INDIVIDUAL}),
        }),
        claimantDetailsUrl: constructResponseUrlWithIdParams(claimId, CITIZEN_CONTACT_THEM_URL),
      }));
    });

    it('should render organisation financial details page', async () => {
      mockGetCaseData.mockResolvedValue(claimWithType(PartyType.ORGANISATION));

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claim: expect.objectContaining({
          respondent1: expect.objectContaining({type: PartyType.ORGANISATION}),
        }),
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect for individual', async () => {
      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_BANK_ACCOUNT_URL));
    });

    it('should redirect for organisation', async () => {
      mockGetCaseData.mockResolvedValue(claimWithType(PartyType.ORGANISATION));

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('error');
      mockGetCaseData.mockRejectedValue(error);

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should re-render and log error when no respondent type is present', async () => {
      mockGetCaseData.mockResolvedValue(claimWithType());

      await postHandler(req as AppRequest, res as unknown as Response, next);

      expect(mockLogger.error).toHaveBeenCalledWith('No partyType found.');
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimantDetailsUrl: constructResponseUrlWithIdParams(claimId, CITIZEN_CONTACT_THEM_URL),
      }));
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });
});
