import {Response} from 'express';
import coscCheckAnswersController from '../../../../../../../main/routes/features/generalApplication/certOfSorC/checkAnswersController';
import {GA_COSC_CONFIRM_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {submitCoScApplication} from 'services/features/generalApplication/submitApplication';
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
jest.mock('services/features/generalApplication/submitApplication', () => ({
  submitCoScApplication: jest.fn(),
}));

describe('General Application - Check your answers', () => {
  const getHandler = getRouteHandler(coscCheckAnswersController, 'get');
  const postHandler = getRouteHandler(coscCheckAnswersController, 'post');
  const viewPath = 'features/generalApplication/check-answers';
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
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
  const mockSubmitApplication = submitCoScApplication as jest.Mock;

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
    (draftStoreService.deleteDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    mockGetCaseData.mockResolvedValue(claim);
    mockSaveDraftClaim.mockResolvedValue(undefined);
    mockSubmitApplication.mockResolvedValue(claim);
  });

  describe('on GET', () => {
    it('should render the check your answers page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        headerTitle: 'COMMON.ASK_FOR_PROOF_OF_DEBT_PAYMENT',
        summaryRows: expect.any(Array),
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      (getClaimById as jest.Mock).mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when the statement of truth is incomplete', async () => {
      req.body = {signed: null, name: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should add the application id and fee to the confirmation url', async () => {
      claim.generalApplication.applicationFee = {calculatedAmountInPence: 25000, code: 'test', version: 1};
      mockSubmitApplication.mockResolvedValue({
        generalApplications: [{id: '123456', value: {gaApp: 'yes'}}],
      } as Claim);
      req.body = {signed: 'yes', name: 'Mr Defendant'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdParams(claimId, GA_COSC_CONFIRM_URL) + '?appFee=250&id=123456',
      );
    });

    it('should call next when saving the statement of truth fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraftClaim.mockRejectedValue(error);
      req.body = {signed: 'yes', name: 'Mr Applicant'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
