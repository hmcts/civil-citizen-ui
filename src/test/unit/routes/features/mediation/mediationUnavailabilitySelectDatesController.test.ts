import {NextFunction, Response} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CaseState} from 'form/models/claimDetails';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {MediationCarm} from 'models/mediation/mediationCarm';
import mediationUnavailabilitySelectDatesController from 'routes/features/mediation/mediationUnavailabilitySelectDatesController';
import {
  CLAIMANT_RESPONSE_TASK_LIST_URL,
  MEDIATION_UNAVAILABLE_SELECT_DATES_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {getMediationCarm, saveMediationCarm} from 'services/features/response/mediation/mediationService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/response/mediation/mediationService', () => ({
  getMediationCarm: jest.fn(),
  saveMediationCarm: jest.fn(),
}));

jest.mock('modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  getCaseDataFromStore: jest.fn(),
}));

const mockGetMediationCarm = getMediationCarm as jest.Mock;
const mockSaveMediationCarm = saveMediationCarm as jest.Mock;
const mockGenerateRedisKey = generateRedisKey as jest.Mock;
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const claimId = '1111';
const redisKey = '12345';
const viewPath = 'features/mediation/unavailable-dates-mediation';

const dateParts = (daysAhead: number): {day: string; month: string; year: string} => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return {
    day: String(date.getDate()),
    month: String(date.getMonth() + 1),
    year: String(date.getFullYear()),
  };
};

const invoke = async (method: 'get' | 'post', overrides: Partial<AppRequest> = {}) => {
  const res = createMockResponse();
  const next = jest.fn() as NextFunction;
  const req = {
    params: {id: claimId},
    body: {},
    query: {},
    cookies: {},
    session: createMockSession({user: {id: 'user-1'}}),
    ...overrides,
  };
  await getRouteHandler(mediationUnavailabilitySelectDatesController, method, MEDIATION_UNAVAILABLE_SELECT_DATES_URL)(
    req as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Mediation Unavailability Select Dates Confirmation Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateRedisKey.mockReturnValue(redisKey);
    const claim = new Claim();
    claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
    mockGetCaseData.mockResolvedValue(claim);
    mockGetMediationCarm.mockResolvedValue(new MediationCarm());
    mockSaveMediationCarm.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return Mediation unavailability dates page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        pageTitle: 'PAGES.UNAVAILABILITY_SELECT_DATES_MEDIATION.PAGE_TITLE',
        isCarm: true,
      }));
    });

    it('should call next when loading unavailability dates fails', async () => {
      const error = new Error('redis failure');
      mockGetMediationCarm.mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the defendant task list with a single date', async () => {
      const {res} = await invoke('post', {
        body: {
          items: [{
            type: UnavailableDateType.SINGLE_DATE,
            single: {start: dateParts(1)},
          }],
        },
      });

      expect(mockSaveMediationCarm).toHaveBeenCalledWith(redisKey, true, 'hasAvailabilityMediationFinished');
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should redirect to the claimant task list with a longer period', async () => {
      const claim = new Claim();
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      mockGetCaseData.mockResolvedValue(claim);

      const {res} = await invoke('post', {
        body: {
          items: [{
            type: UnavailableDateType.LONGER_PERIOD,
            period: {start: dateParts(1), end: dateParts(2)},
          }],
        },
      });

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    });

    it('should call next when saving unavailability dates fails', async () => {
      const error = new Error('redis failure');
      mockSaveMediationCarm.mockRejectedValue(error);

      const {next} = await invoke('post', {
        body: {
          items: [{
            type: UnavailableDateType.SINGLE_DATE,
            single: {start: dateParts(1)},
          }],
        },
      });

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
