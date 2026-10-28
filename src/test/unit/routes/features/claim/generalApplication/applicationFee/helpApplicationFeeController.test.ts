import {Response} from 'express';
import helpWithApplicationFeeController from '../../../../../../../main/routes/features/generalApplication/applicationFee/helpWithApplicationFeeController';
import {GA_APPLY_HELP_WITH_FEES, GA_VIEW_APPLICATION_URL, GENERAL_APPLICATION_CONFIRM_URL} from 'routes/urls';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {getApplicationIndex} from 'services/features/generalApplication/generalApplicationService';
import {getRedirectUrl} from 'services/features/generalApplication/fee/helpWithFeeService';
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
jest.mock('modules/draft-store/gaHwFeesDraftStore', () => ({
  getDraftGAHWFDetails: jest.fn(),
  saveDraftGAHWFDetails: jest.fn(),
}));
jest.mock('services/features/generalApplication/fee/helpWithFeeService', () => ({
  getRedirectUrl: jest.fn(),
}));
jest.mock('services/features/generalApplication/generalApplicationService', () => {
  const actual = jest.requireActual('services/features/generalApplication/generalApplicationService');
  return {
    ...actual,
    getApplicationIndex: jest.fn(),
  };
});

describe('General Application - Do you want to apply for help with fees Page', () => {
  const getHandler = getRouteHandler(helpWithApplicationFeeController, 'get');
  const postHandler = getRouteHandler(helpWithApplicationFeeController, 'post');
  const viewPath = 'features/generalApplication/applicationFee/help-with-application-fee';
  const claimId = '12345';
  const appId = '67890';
  let claim: Claim;
  let req: {
    params: {id: string; appId: string};
    body: Record<string, unknown>;
    query: Record<string, string>;
    cookies: Record<string, string>;
    session: {user: {id: string}};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetDraft = getDraftGAHWFDetails as jest.Mock;
  const mockGetRedirectUrl = getRedirectUrl as jest.Mock;
  const mockGetApplicationIndex = getApplicationIndex as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;

  const buildClaim = (): Claim => {
    const built = new Claim();
    built.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    built.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
    return built;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    claim = buildClaim();
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
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue(appId);
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    mockGetDraft.mockImplementation(async () => new GaHelpWithFees());
    mockGetApplicationIndex.mockResolvedValue(0);
    mockSaveDraftClaim.mockResolvedValue(undefined);
    mockGetRedirectUrl.mockResolvedValue(
      constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_APPLY_HELP_WITH_FEES),
    );
  });

  describe('on GET', () => {
    it('should render the help with fees selection page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        backLinkUrl: `${constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_VIEW_APPLICATION_URL)}?index=1`,
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should clear a payment sync error and show the warning', async () => {
      claim.paymentSyncError = true;

      await getHandler(req as never, res as unknown as Response, next);

      expect(claim.paymentSyncError).toBeUndefined();
      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(JSON.stringify((res.render as jest.Mock).mock.calls[0][1].applyHelpWithFeeSelectionContents))
        .toContain('PAGES.FEE_AMOUNT.SYNC_WARNING');
    });

    it('should link back to the confirmation page when a request id is present', async () => {
      req.query = {id: '99', appFee: '10'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        backLinkUrl: constructResponseUrlWithIdParams(claimId, GENERAL_APPLICATION_CONFIRM_URL) + '?id=99&appFee=10',
      }));
      expect(mockGetApplicationIndex).not.toHaveBeenCalled();
    });

    it('should render a previously selected yes answer', async () => {
      const draft = new GaHelpWithFees();
      draft.applyHelpWithFees = new GenericYesNo(YesNo.YES);
      mockGetDraft.mockResolvedValue(draft);

      await getHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.model.option).toBe(YesNo.YES);
    });

    it('should call next when loading the draft fails', async () => {
      const error = new Error('redis failure');
      mockGetDraft.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the url returned for a yes answer', async () => {
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockGetRedirectUrl).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_APPLY_HELP_WITH_FEES),
      );
    });

    it('should re-render when no answer is selected', async () => {
      req.body = {option: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockGetRedirectUrl).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next when the redirect lookup fails', async () => {
      const error = new Error('redis failure');
      mockGetRedirectUrl.mockRejectedValue(error);
      req.body = {option: YesNo.YES};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
