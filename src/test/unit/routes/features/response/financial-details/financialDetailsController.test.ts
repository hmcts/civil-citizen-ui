import {Request, Response} from 'express';
import {LoggerInstance} from 'winston';
import financialDetailsController, {
  setFinancialDetailsControllerLogger,
} from '../../../../../../main/routes/features/response/financialDetails/financialDetailsController';
import {CITIZEN_BANK_ACCOUNT_URL, CITIZEN_CONTACT_THEM_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as financialDetailsService from 'services/features/response/financialDetails/financialDetailsService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/response/financialDetails/financialDetailsService', () => {
  const actual = jest.requireActual('services/features/response/financialDetails/financialDetailsService');
  return {
    ...actual,
    getFinancialDetailsClaim: jest.fn(),
    saveSharedFinancialDetails: jest.fn(),
  };
});

const mockLogger = {
  error: jest.fn().mockImplementation((message: string) => message),
  info: jest.fn().mockImplementation((message: string) => message),
} as unknown as LoggerInstance;

describe('Citizen financial details', () => {
  const getHandler = getRouteHandler(financialDetailsController, 'get');
  const postHandler = getRouteHandler(financialDetailsController, 'post');
  const viewPath = 'features/response/financialDetails/financial-details';
  const claimId = '12345';
  let req: Partial<Request>;
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetFinancialDetailsClaim = financialDetailsService.getFinancialDetailsClaim as jest.Mock;
  const mockSaveSharedFinancialDetails = financialDetailsService.saveSharedFinancialDetails as jest.Mock;

  const claimForParty = (partyType?: PartyType): Claim => {
    const claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.type = partyType;
    return claim;
  };

  beforeAll(() => {
    setFinancialDetailsControllerLogger(mockLogger);
  });

  beforeEach(() => {
    req = {params: {id: claimId}, body: {}, query: {}, cookies: {}};
    res = createMockResponse();
    next = jest.fn();
    jest.clearAllMocks();
    mockGetFinancialDetailsClaim.mockResolvedValue(claimForParty(PartyType.INDIVIDUAL));
    mockSaveSharedFinancialDetails.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render financial details for an individual', async () => {
      const claim = claimForParty(PartyType.INDIVIDUAL);
      mockGetFinancialDetailsClaim.mockResolvedValue(claim);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claim,
        claimantDetailsUrl: constructResponseUrlWithIdParams(claimId, CITIZEN_CONTACT_THEM_URL),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should render financial details for an organisation', async () => {
      const claim = claimForParty(PartyType.ORGANISATION);
      mockGetFinancialDetailsClaim.mockResolvedValue(claim);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claim,
        claimantDetailsUrl: constructResponseUrlWithIdParams(claimId, CITIZEN_CONTACT_THEM_URL),
      }));
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetFinancialDetailsClaim.mockRejectedValue(error);

      await getHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect an individual to the bank account page', async () => {
      mockGetFinancialDetailsClaim.mockResolvedValue(claimForParty(PartyType.INDIVIDUAL));

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveSharedFinancialDetails).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CITIZEN_BANK_ACCOUNT_URL));
    });

    it('should save and redirect an organisation to the task list', async () => {
      mockGetFinancialDetailsClaim.mockResolvedValue(claimForParty(PartyType.ORGANISATION));

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockSaveSharedFinancialDetails).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should re-render and log when the respondent has no party type', async () => {
      mockGetFinancialDetailsClaim.mockResolvedValue(claimForParty());

      await postHandler(req as Request, res as unknown as Response, next);

      expect(mockLogger.error).toHaveBeenCalledWith('No partyType found.');
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimantDetailsUrl: constructResponseUrlWithIdParams(claimId, CITIZEN_CONTACT_THEM_URL),
      }));
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('draft failure');
      mockGetFinancialDetailsClaim.mockRejectedValue(error);

      await postHandler(req as Request, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
