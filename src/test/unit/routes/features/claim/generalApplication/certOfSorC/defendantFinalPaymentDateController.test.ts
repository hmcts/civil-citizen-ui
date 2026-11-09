import {Response} from 'express';
import defendantPaymentDateController from '../../../../../../../main/routes/features/generalApplication/certOfSorC/defendantFinalPaymentDateController';
import {GA_DEBT_PAYMENT_EVIDENCE_COSC_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
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

describe('CoSorS - defendant Payment date', () => {
  const getHandler = getRouteHandler(defendantPaymentDateController, 'get');
  const postHandler = getRouteHandler(defendantPaymentDateController, 'post');
  const viewPath = 'features/generalApplication/certOfSorC/final-payment-date';
  const claimId = '12345';
  let claim: Claim;
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
    const built = new Claim();
    built.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    built.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID));
    return built;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    claim = buildClaim();
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
    (getClaimById as jest.Mock).mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it('should render the payment date page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        title: 'COMMON.ASK_FOR_PROOF_OF_DEBT_PAYMENT',
        form: expect.anything(),
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('on POST', () => {
    it('should re-render when the date is empty', async () => {
      req.body = {year: '', month: '', day: ''};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render when the month is invalid', async () => {
      req.body = {year: '2023', month: '13', day: '1'};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect when the date is in the past', async () => {
      req.body = {year: '1999', month: '1', day: '1'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(draftStoreService.saveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, GA_DEBT_PAYMENT_EVIDENCE_COSC_URL),
      );
    });

    it('should re-render when the date is in the future', async () => {
      req.body = {year: '9999', month: '1', day: '1'};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });
});
