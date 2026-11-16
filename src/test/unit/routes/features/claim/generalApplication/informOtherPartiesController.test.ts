import {Response} from 'express';
import informOtherPartiesController from '../../../../../../main/routes/features/generalApplication/informOtherPartiesController';
import {GA_APPLICATION_COSTS_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {InformOtherParties} from 'models/generalApplication/informOtherParties';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));

describe('General Application - inform other parties', () => {
  const getHandler = getRouteHandler(informOtherPartiesController, 'get');
  const postHandler = getRouteHandler(informOtherPartiesController, 'post');
  const viewPath = 'features/generalApplication/inform-other-parties';
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
  const flushAsync = () => new Promise(resolve => setImmediate(resolve));

  const buildClaim = (): Claim => {
    const builtClaim = new Claim();
    builtClaim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    builtClaim.generalApplication = new GeneralApplication();
    builtClaim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM)];
    builtClaim.generalApplication.informOtherParties = new InformOtherParties();
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
  });

  describe('on GET', () => {
    it('should render the inform other parties page', async () => {
      await getHandler(req as never, res as unknown as Response, next);
      await flushAsync();

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.PAUSE',
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);
      await flushAsync();

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should save and redirect to application costs', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_APPLICATION_COSTS_URL), undefined),
      );
    });

    it('should re-render when no option is selected', async () => {
      req.body = {option: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should re-render when no is selected without a reason', async () => {
      req.body = {option: 'no'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockGetCaseData.mockRejectedValue(error);
      req.body = {option: 'yes'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
