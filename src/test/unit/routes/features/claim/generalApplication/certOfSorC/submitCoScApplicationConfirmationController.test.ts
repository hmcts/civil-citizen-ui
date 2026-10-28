import {Response} from 'express';
import submitCoScApplicationConfirmationController from '../../../../../../../main/routes/features/generalApplication/certOfSorC/submitCoScApplicationConfirmationController';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {createMockResponse, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));

describe('GA submission confirmation controller', () => {
  const getHandler = getRouteHandler(submitCoScApplicationConfirmationController, 'get');
  const viewPath = 'features/generalApplication/submit-general-application-confirmation';
  const claimId = '12345';
  let req: {
    params: {id: string};
    body: Record<string, unknown>;
    query: Record<string, string>;
    cookies: Record<string, string>;
    session: {user: {id: string}};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;

  const buildClaim = (): Claim => {
    const claim = new Claim();
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    claim.generalApplication = new GeneralApplication();
    claim.generalApplication.applicationFee = {
      calculatedAmountInPence: 100,
      code: 'test',
      version: 1,
    };
    return claim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {id: claimId},
      body: {},
      query: {appFee: '1'},
      cookies: {},
      session: {user: {id: 'user-1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimById as jest.Mock).mockResolvedValue(buildClaim());
  });

  describe('on GET', () => {
    it('should render the certificate of satisfaction confirmation page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        confirmationContent: expect.any(Array),
      }));
      expect(JSON.stringify((res.render as jest.Mock).mock.calls[0][1].confirmationContent))
        .toContain('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_PAY_FEE');
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      (getClaimById as jest.Mock).mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
