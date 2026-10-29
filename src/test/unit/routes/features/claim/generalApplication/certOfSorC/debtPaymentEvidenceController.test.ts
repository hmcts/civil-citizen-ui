import {Response} from 'express';
import debtPaymentEvidenceController from '../../../../../../../main/routes/features/generalApplication/certOfSorC/debtPaymentEvidenceController';
import {GA_CHECK_YOUR_ANSWERS_COSC_URL, GA_UPLOAD_DOCUMENTS_COSC_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';
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

describe('General Application - CoSorC - debt payment evidence controller', () => {
  const getHandler = getRouteHandler(debtPaymentEvidenceController, 'get');
  const postHandler = getRouteHandler(debtPaymentEvidenceController, 'post');
  const viewPath = 'features/generalApplication/certOfSorC/debt-payment-evidence';
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
    built.id = claimId;
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
    it('should render the debt payment evidence page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.GENERAL_APPLICATION.DEBT_PAYMENT.DO_YOU_HAVE_EVIDENCE',
        DebtPaymentOptions: debtPaymentOptions,
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('on POST', () => {
    it('should re-render when no evidence option is chosen', async () => {
      req.body = {debtPaymentOption: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should re-render when details are missing for an unable-to-provide answer', async () => {
      req.body = {debtPaymentOption: debtPaymentOptions.UNABLE_TO_PROVIDE_EVIDENCE_OF_FULL_PAYMENT};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to the upload documents page', async () => {
      req.body = {debtPaymentOption: debtPaymentOptions.UPLOAD_EVIDENCE_DEBT_PAID_IN_FULL};

      await postHandler(req as never, res as unknown as Response, next);

      expect(draftStoreService.saveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, GA_UPLOAD_DOCUMENTS_COSC_URL));
    });

    it('should redirect to check your answers when details are provided', async () => {
      req.body = {
        debtPaymentOption: debtPaymentOptions.UNABLE_TO_PROVIDE_EVIDENCE_OF_FULL_PAYMENT,
        provideDetails: 'some evidence',
      };

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, GA_CHECK_YOUR_ANSWERS_COSC_URL));
    });
  });
});
