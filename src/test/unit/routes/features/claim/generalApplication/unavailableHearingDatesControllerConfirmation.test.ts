import {Response} from 'express';
import gaUnavailabilityDatesConfirmationController from '../../../../../../main/routes/features/generalApplication/unavailableHearingDatesControllerConfirmation';
import {GA_HEARING_SUPPORT_URL, GA_UNAVAILABLE_HEARING_DATES_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

describe('General Application - Unavailable hearing dates confirmation', () => {
  const getHandler = getRouteHandler(gaUnavailabilityDatesConfirmationController, 'get');
  const postHandler = getRouteHandler(gaUnavailabilityDatesConfirmationController, 'post');
  const viewPath = 'features/generalApplication/unavailable-dates-confirmation.njk';
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

  const buildClaim = (): Claim => {
    const builtClaim = new Claim();
    builtClaim.applicant1 = {
      type: PartyType.INDIVIDUAL,
      partyDetails: {title: 'Mr', firstName: 'Jan', lastName: 'Clark'},
    } as Claim['applicant1'];
    builtClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
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
  });

  describe('on GET', () => {
    it('should render the unavailability confirmation page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        headerTitle: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_HEARING',
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when loading the claim fails', async () => {
      const error = new Error('redis failure');
      mockGetClaim.mockRejectedValue(error);

      await getHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to unavailable dates when the user selects yes', async () => {
      req.body = {option: 'yes'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_UNAVAILABLE_HEARING_DATES_URL), 0),
      );
    });

    it('should redirect to hearing support when the user selects no', async () => {
      req.body = {option: 'no'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_HEARING_SUPPORT_URL), 0),
      );
    });

    it('should re-render when no option is selected', async () => {
      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockGetClaim.mockRejectedValue(error);
      req.body = {option: 'yes'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
