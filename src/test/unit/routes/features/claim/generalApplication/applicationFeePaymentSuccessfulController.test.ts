import {Response} from 'express';
import applicationFeePaymentSuccessfulController from '../../../../../../main/routes/features/generalApplication/applicationFeePaymentSuccessfulController';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {getApplicationFromGAService} from 'services/features/generalApplication/generalApplicationService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));
jest.mock('services/features/generalApplication/generalApplicationService', () => {
  const actual = jest.requireActual('services/features/generalApplication/generalApplicationService');
  return {
    ...actual,
    getApplicationFromGAService: jest.fn(),
  };
});

describe('Claim fee payment confirmation', () => {
  const getHandler = getRouteHandler(applicationFeePaymentSuccessfulController, 'get');
  const viewPath = 'features/generalApplication/payment-successful';
  const claimId = '12345';
  const appId = '67890';
  let claim: Claim;
  let applicationResponse: ApplicationResponse;
  let req: {
    params: {id: string; appId?: string};
    body: Record<string, unknown>;
    query: Record<string, string>;
    cookies: Record<string, string>;
    session: {user: {id: string}};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetApplication = getApplicationFromGAService as jest.Mock;

  const buildClaim = (): Claim => {
    const built = new Claim();
    built.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    built.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM));
    built.generalApplication.applicationFeePaymentDetails = new PaymentInformation();
    built.generalApplication.applicationFeePaymentDetails.paymentReference = 'REF-123-123';
    built.caseProgressionHearing = new CaseProgressionHearing();
    return built;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    claim = buildClaim();
    applicationResponse = {
      case_data: {
        generalAppPBADetails: {
          fee: {calculatedAmountInPence: 1400},
          paymentDetails: {
            status: 'SUCCESS',
            reference: 'REF-123-123',
          },
        },
      },
    } as ApplicationResponse;
    req = {
      params: {id: claimId, appId},
      body: {},
      query: {},
      cookies: {},
      session: {user: {id: 'user-1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    mockGetApplication.mockResolvedValue(applicationResponse);
  });

  describe('on GET', () => {
    it('should render the successful payment page with the payment reference', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(mockGetApplication).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.TITLE',
        noCrumbs: true,
      }));
      expect(JSON.stringify((res.render as jest.Mock).mock.calls[0][1].gaPaymentSuccessfulPanel)).toContain('REF-123-123');
      expect(JSON.stringify((res.render as jest.Mock).mock.calls[0][1].gaPaymentSuccessfulBody))
        .toContain('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT');
      expect(next).not.toHaveBeenCalled();
    });

    it('should render the application submitted page when there is no application id', async () => {
      claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING)];
      claim.caseProgressionHearing.hearingDate = new Date('2026-01-01');
      delete req.params.appId;

      await getHandler(req as never, res as unknown as Response, next);

      expect(mockGetApplication).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.TITLE',
      }));
      expect(JSON.stringify((res.render as jest.Mock).mock.calls[0][1].gaPaymentSuccessfulPanel))
        .toContain('govuk-!-font-size-36');
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      (getClaimById as jest.Mock).mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
