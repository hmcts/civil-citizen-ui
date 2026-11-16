import {Response} from 'express';
import askProofOfDebtPaymentGuidanceController from '../../../../../../../main/routes/features/generalApplication/certOfSorC/askProofOfDebtPaymentGuidanceController';
import {BACK_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {CivilServiceClient} from 'client/civilServiceClient';
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

describe('General Application - ask proof of debt payment guidance', () => {
  const getHandler = getRouteHandler(askProofOfDebtPaymentGuidanceController, 'get');
  const viewPath = 'features/generalApplication/certOfSorC/ask-proof-debtPayment-guidance';
  const claimId = '12345';
  const gaFeeDetails = {
    calculatedAmountInPence: 1400,
    code: 'FEE0459',
    version: 0,
  };
  let req: {
    params: {id: string};
    body: Record<string, unknown>;
    query: Record<string, string>;
    cookies: Record<string, string>;
    session: {user: {id: string}};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  let getGeneralApplicationFee: jest.SpyInstance;

  const withApplicant = (claim: Claim): Claim => {
    claim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return claim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: {user: {id: 'user-1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);
    getGeneralApplicationFee = jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee')
      .mockResolvedValue(gaFeeDetails);
  });

  afterEach(() => {
    getGeneralApplicationFee.mockRestore();
  });

  describe('on GET', () => {
    it('should render the guidance page with the application fee', async () => {
      const claim = withApplicant(new Claim());
      claim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID));
      (getClaimById as jest.Mock).mockResolvedValue(claim);

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        applicationFee: 14,
        backLinkUrl: BACK_URL,
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should initialise generalApplication when it is missing', async () => {
      const claim = withApplicant(new Claim());
      (getClaimById as jest.Mock).mockResolvedValue(claim);

      await getHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication?.applicationTypes).toHaveLength(1);
      expect(claim.generalApplication?.applicationTypes[0].option).toBe(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID);
      expect((res.render as jest.Mock).mock.calls[0][1].backLinkUrl)
        .toBe((res.render as jest.Mock).mock.calls[0][1].cancelUrl);
    });

    it('should inject the debt application type when applicationTypes is empty', async () => {
      const claim = withApplicant(new Claim());
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [];
      (getClaimById as jest.Mock).mockResolvedValue(claim);

      await getHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication?.applicationTypes).toHaveLength(1);
      expect(claim.generalApplication?.applicationTypes[0].option).toBe(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID);
    });

    it('should replace a non-persistable application type', async () => {
      const claim = withApplicant(new Claim());
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.OTHER_OPTION)];
      (getClaimById as jest.Mock).mockResolvedValue(claim);

      await getHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication?.applicationTypes).toHaveLength(1);
      expect(claim.generalApplication?.applicationTypes[0].option).toBe(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID);
    });

    it('should replace duplicate application types and request the fee', async () => {
      const claim = withApplicant(new Claim());
      claim.generalApplication = new GeneralApplication();
      claim.generalApplication.applicationTypes = [
        new ApplicationType(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID),
        new ApplicationType(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID),
      ];
      (getClaimById as jest.Mock).mockResolvedValue(claim);

      await getHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication?.applicationTypes).toHaveLength(1);
      expect(claim.generalApplication?.applicationTypes[0].option).toBe(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID);
      expect(getGeneralApplicationFee).toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('Database connection failed');
      (getClaimById as jest.Mock).mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
