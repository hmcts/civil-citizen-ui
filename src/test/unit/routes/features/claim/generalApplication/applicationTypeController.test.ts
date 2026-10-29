import {Response} from 'express';
import applicationTypeController from '../../../../../../main/routes/features/generalApplication/applicationTypeController';
import {GA_AGREEMENT_FROM_OTHER_PARTY_URL, GA_CHECK_ANSWERS_URL, ORDER_JUDGE_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {YesNo} from 'form/models/yesNo';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption, LinkFromValues} from 'models/generalApplication/applicationType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {isQueryManagementEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {
  SHOW_APPLICATION_TYPE_ERROR_QUERY_PARAM,
  SHOW_DUPLICATE_APPLICATION_TYPE_ERROR_QUERY_PARAM,
} from 'routes/guards/generalApplication/applicationTypeGuard';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));
jest.mock('app/auth/launchdarkly/launchDarklyClient');

describe('General Application - Application type', () => {
  const getHandler = getRouteHandler(applicationTypeController, 'get');
  const postHandler = getRouteHandler(applicationTypeController, 'post');
  const viewPath = 'features/generalApplication/application-type';
  const claimId = '12345';
  let claim: Claim;
  let req: {
    params: {id: string};
    body: Record<string, unknown>;
    query: Record<string, unknown>;
    cookies: Record<string, unknown>;
    session: {user: {id: string}};
  };
  let res: ReturnType<typeof createMockResponse>;
  let next: jest.Mock;
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
  const mockGetClaim = getClaimById as jest.Mock;
  const isQueryManagementEnabledMock = isQueryManagementEnabled as jest.Mock;

  const buildClaim = (): Claim => {
    const builtClaim = new Claim();
    builtClaim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    return builtClaim;
  };

  const withApplicationTypes = (options: ApplicationTypeOption[]): Claim => {
    const builtClaim = buildClaim();
    builtClaim.generalApplication = new GeneralApplication();
    builtClaim.generalApplication.applicationTypes = options.map(option => new ApplicationType(option));
    return builtClaim;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    claim = buildClaim();
    req = {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: {user: {id: 'u1'}},
    };
    res = createMockResponse();
    next = jest.fn();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (draftStoreService.generateRedisKeyForGA as jest.Mock).mockReturnValue('ga-12345');
    mockGetCaseData.mockResolvedValue(claim);
    mockSaveDraftClaim.mockResolvedValue(undefined);
    mockGetClaim.mockResolvedValue(claim);
    isQueryManagementEnabledMock.mockResolvedValue(false);
  });

  describe('on GET', () => {
    it('should render with query management enabled', async () => {
      isQueryManagementEnabledMock.mockResolvedValue(true);

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        isQMEnabled: true,
      }));
    });

    it('should render the application type page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        isQMEnabled: false,
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should show a validation error when the application type is missing from a later screen', async () => {
      req.query = {[SHOW_APPLICATION_TYPE_ERROR_QUERY_PARAM]: 'true'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should show a duplicate validation error when a duplicate application type is selected', async () => {
      claim = withApplicationTypes([ApplicationTypeOption.VARY_ORDER, ApplicationTypeOption.VARY_ORDER]);
      mockGetClaim.mockResolvedValue(claim);
      req.query = {index: '1', [SHOW_DUPLICATE_APPLICATION_TYPE_ERROR_QUERY_PARAM]: 'true'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should delete the general application when the url contains start', async () => {
      const spyDelete = jest.spyOn(generalApplicationService, 'deleteGAFromClaimsByUserId');
      req.query = {linkFrom: LinkFromValues.start};

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        isAskMoreTime: false,
      }));
      expect(spyDelete).toHaveBeenCalledWith('u1');
    });

    it('should delete the general application when the url contains start and isAskMoreTime', async () => {
      const spyDelete = jest.spyOn(generalApplicationService, 'deleteGAFromClaimsByUserId');
      req.query = {linkFrom: LinkFromValues.start, isAskMoreTime: 'true'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        isAskMoreTime: true,
      }));
      expect(spyDelete).toHaveBeenCalled();
    });

    it('should select the application type when returning via the back link', async () => {
      claim = withApplicationTypes([ApplicationTypeOption.EXTEND_TIME]);
      mockGetClaim.mockResolvedValue(claim);
      req.query = {index: '0'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.model.option).toEqual(ApplicationTypeOption.EXTEND_TIME);
    });

    it('should not mark the application type change as in progress when entered from check your answers', async () => {
      claim = withApplicationTypes([ApplicationTypeOption.EXTEND_TIME]);
      mockGetClaim.mockResolvedValue(claim);
      req.query = {index: '0', changeScreen: 'true'};

      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect(claim.generalApplication.applicationTypeChangeInProgress).toBeUndefined();
      expect(claim.generalApplication.applicationTypeChangeIndex).toBeUndefined();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaim.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should save the application type and redirect to agreement from the other party', async () => {
      req.body = {option: ApplicationTypeOption.ADJOURN_HEARING};

      await postHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication.applicationTypes[0].option).toEqual(ApplicationTypeOption.ADJOURN_HEARING);
      expect(res.redirect).toHaveBeenCalledWith(
        `${constructResponseUrlWithIdParams(claimId, GA_AGREEMENT_FROM_OTHER_PARTY_URL)}?index=0`,
      );
    });

    it('should save the other application type and redirect', async () => {
      req.body = {option: ApplicationTypeOption.OTHER_OPTION, optionOther: ApplicationTypeOption.OTHER};

      await postHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication.applicationTypes[0].option).toEqual(ApplicationTypeOption.OTHER);
      expect(res.redirect).toHaveBeenCalledWith(
        `${constructResponseUrlWithIdParams(claimId, GA_AGREEMENT_FROM_OTHER_PARTY_URL)}?index=0`,
      );
    });

    it('should update the existing application type instead of appending when revisiting without an index', async () => {
      claim = withApplicationTypes([ApplicationTypeOption.EXTEND_TIME]);
      mockGetClaim.mockResolvedValue(claim);
      req.body = {option: ApplicationTypeOption.ADJOURN_HEARING};

      await postHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication.applicationTypes).toHaveLength(1);
      expect(claim.generalApplication.applicationTypes[0].option).toEqual(ApplicationTypeOption.ADJOURN_HEARING);
      expect(res.redirect).toHaveBeenCalledWith(
        `${constructResponseUrlWithIdParams(claimId, GA_AGREEMENT_FROM_OTHER_PARTY_URL)}?index=0`,
      );
    });

    it('should append an application type when add another application provides the next index', async () => {
      claim = withApplicationTypes([ApplicationTypeOption.EXTEND_TIME]);
      mockGetClaim.mockResolvedValue(claim);
      req.query = {linkFrom: LinkFromValues.addAnotherApp, index: '1'};
      req.body = {option: ApplicationTypeOption.ADJOURN_HEARING};

      await postHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication.applicationTypes).toHaveLength(2);
      expect(claim.generalApplication.applicationTypes[1].option).toEqual(ApplicationTypeOption.ADJOURN_HEARING);
      expect(res.redirect).toHaveBeenCalledWith(
        `${constructResponseUrlWithIdParams(claimId, ORDER_JUDGE_URL)}?index=1`,
      );
    });

    it('should not keep check your answers query params when changing one application in a multi-application journey', async () => {
      claim = withApplicationTypes([ApplicationTypeOption.EXTEND_TIME, ApplicationTypeOption.STAY_THE_CLAIM]);
      mockGetClaim.mockResolvedValue(claim);
      req.query = {index: '0', changeScreen: 'true'};
      req.body = {option: ApplicationTypeOption.ADJOURN_HEARING};

      await postHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication.applicationTypes).toHaveLength(2);
      expect(claim.generalApplication.applicationTypes[0].option).toEqual(ApplicationTypeOption.ADJOURN_HEARING);
      expect(res.redirect).toHaveBeenCalledWith(
        `${constructResponseUrlWithIdParams(claimId, ORDER_JUDGE_URL)}?index=0`,
      );
    });

    it('should return to check your answers and preserve journey data when the same application type is selected', async () => {
      claim = withApplicationTypes([ApplicationTypeOption.EXTEND_TIME]);
      claim.generalApplication.agreementFromOtherParty = YesNo.YES;
      claim.generalApplication.applicationFee = {calculatedAmountInPence: 5000};
      claim.generalApplication.applicationTypeChangeInProgress = true;
      claim.generalApplication.applicationTypeChangeIndex = 0;
      mockGetClaim.mockResolvedValue(claim);
      req.query = {index: '0', changeScreen: 'true'};
      req.body = {option: ApplicationTypeOption.EXTEND_TIME};

      await postHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication.applicationTypes).toHaveLength(1);
      expect(claim.generalApplication.applicationTypes[0].option).toEqual(ApplicationTypeOption.EXTEND_TIME);
      expect(claim.generalApplication.agreementFromOtherParty).toBe(YesNo.YES);
      expect(claim.generalApplication.applicationFee).toEqual({calculatedAmountInPence: 5000});
      expect(claim.generalApplication.applicationTypeChangeInProgress).toBeUndefined();
      expect(claim.generalApplication.applicationTypeChangeIndex).toBeUndefined();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, GA_CHECK_ANSWERS_URL));
    });

    it('should update the latest application type when add another is resubmitted without an index', async () => {
      claim = withApplicationTypes([ApplicationTypeOption.EXTEND_TIME, ApplicationTypeOption.STAY_THE_CLAIM]);
      mockGetClaim.mockResolvedValue(claim);
      req.query = {linkFrom: LinkFromValues.addAnotherApp};
      req.body = {option: ApplicationTypeOption.ADJOURN_HEARING};

      await postHandler(req as never, res as unknown as Response, next);

      expect(claim.generalApplication.applicationTypes).toHaveLength(2);
      expect(claim.generalApplication.applicationTypes[1].option).toEqual(ApplicationTypeOption.ADJOURN_HEARING);
      expect(res.redirect).toHaveBeenCalledWith(
        `${constructResponseUrlWithIdParams(claimId, ORDER_JUDGE_URL)}?index=1`,
      );
    });

    it('should re-render when adding a duplicate application type', async () => {
      claim = withApplicationTypes([ApplicationTypeOption.VARY_ORDER]);
      mockGetClaim.mockResolvedValue(claim);
      req.query = {linkFrom: LinkFromValues.addAnotherApp, index: '1'};
      req.body = {option: ApplicationTypeOption.VARY_ORDER};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(claim.generalApplication.applicationTypes).toHaveLength(1);
    });

    it('should re-render when no application type is selected', async () => {
      req.body = {option: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it.each([
      [ApplicationTypeOption.SET_ASIDE_JUDGEMENT],
      [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT],
      [ApplicationTypeOption.SETTLE_BY_CONSENT],
    ])('should re-render when %s cannot be added as another application', async (applicationType) => {
      claim = withApplicationTypes([ApplicationTypeOption.STAY_THE_CLAIM]);
      mockGetClaim.mockResolvedValue(claim);
      req.query = {linkFrom: LinkFromValues.addAnotherApp};
      req.body = {option: applicationType};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraftClaim.mockRejectedValue(error);
      req.body = {option: ApplicationTypeOption.ADJOURN_HEARING};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
