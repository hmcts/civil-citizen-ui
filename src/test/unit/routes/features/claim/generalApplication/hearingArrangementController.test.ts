import {Response} from 'express';
import hearingArrangementController from '../../../../../../main/routes/features/generalApplication/hearingArrangementController';
import {GA_HEARING_CONTACT_DETAILS_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {CourtLocation} from 'models/courts/courtLocations';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import {getListOfCourtLocations} from 'services/features/directionsQuestionnaire/hearing/specificCourtLocationService';
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
jest.mock('services/features/directionsQuestionnaire/hearing/specificCourtLocationService');

describe('General Application - Application hearing arrangements', () => {
  const getHandler = getRouteHandler(hearingArrangementController, 'get');
  const postHandler = getRouteHandler(hearingArrangementController, 'post');
  const viewPath = 'features/generalApplication/hearing-arrangement';
  const claimId = '12345';
  const courtLocations = [new CourtLocation('1', 'location1'), new CourtLocation('2', 'location2')];
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
  const mockListOfCourtLocations = getListOfCourtLocations as jest.Mock;

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
    mockListOfCourtLocations.mockResolvedValue(courtLocations);
  });

  describe('on GET', () => {
    it('should render the hearing arrangements page', async () => {
      await getHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        courtLocations,
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
    it('should save and redirect to hearing contact details', async () => {
      req.body = {option: 'PERSON_AT_COURT', reasonForPreferredHearingType: 'Testing'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(mockSaveDraftClaim).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_HEARING_CONTACT_DETAILS_URL), 0),
      );
    });

    it('should re-render when the hearing type is missing', async () => {
      req.body = {option: null, reasonForPreferredHearingType: 'Testing'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({courtLocations}));
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should re-render when the reason is missing', async () => {
      req.body = {option: 'PERSON_AT_COURT', reasonForPreferredHearingType: null};

      await postHandler(req as never, res as unknown as Response, next);

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.anything());
      expect((res.render as jest.Mock).mock.calls[0][1].form.hasErrors()).toBe(true);
    });

    it('should call next when saving fails', async () => {
      const error = new Error('redis failure');
      mockSaveDraftClaim.mockRejectedValue(error);
      req.body = {option: 'PERSON_AT_COURT', reasonForPreferredHearingType: 'Testing'};

      await postHandler(req as never, res as unknown as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
