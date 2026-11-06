import {Response} from 'express';
import requestMoreTimeController from 'routes/features/response/requestMoreTimeController';
import {REQUEST_MORE_TIME_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {isCuiGaNroEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {AdditionalTimeOptions} from 'form/models/additionalTime';
import {ResponseDeadline} from 'form/models/responseDeadline';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {ResponseDeadlineService} from 'services/features/response/responseDeadlineService';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient', () => ({
  isCuiGaNroEnabled: jest.fn(),
  isDraftDefendantResponseDatabaseEnabled: jest.fn().mockResolvedValue(false),
}));

const viewPath = 'features/response/request-more-time';
const claimId = '12345';

const storedClaim = (additionalTime?: AdditionalTimeOptions): Claim => {
  const claim = new Claim();
  claim.applicant1 = {
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      partyName: 'Joe Bloggs',
      firstName: 'Joe',
      lastName: 'Bloggs',
    },
  };
  claim.respondent1ResponseDeadline = new Date('2099-06-01T16:00:00.000Z');
  if (additionalTime) {
    claim.responseDeadline = Object.assign(new ResponseDeadline(), {additionalTime});
  }
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(requestMoreTimeController, method, REQUEST_MORE_TIME_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
      ...req,
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('Request More Time Controller', () => {
  let mockSaveAdditionalTime: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (getCaseDataFromStore as jest.Mock).mockImplementation(async () => storedClaim());
    (isCuiGaNroEnabled as jest.Mock).mockResolvedValue(false);
    mockSaveAdditionalTime = jest.spyOn(ResponseDeadlineService.prototype, 'saveAdditionalTime')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('on GET', () => {
    it('should render the page when no additional time is stored', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimantName: storedClaim().getClaimantFullName(),
        additionalTimeOptions: AdditionalTimeOptions,
        isGaNroEnabled: false,
      }));
      expect(res.render.mock.calls[0][1].form.model.option).toBeUndefined();
    });

    it('should render the stored additional time', async () => {
      (getCaseDataFromStore as jest.Mock).mockImplementation(async () => storedClaim(AdditionalTimeOptions.MORE_THAN_28_DAYS));

      const {res} = await invoke('get');

      expect(res.render.mock.calls[0][1].form.model.option).toBe(AdditionalTimeOptions.MORE_THAN_28_DAYS);
    });

    it('should return the error when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should re-render when no additional time is selected', async () => {
      const {res} = await invoke('post');

      expect(res.render.mock.calls[0][0]).toBe(viewPath);
      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(mockSaveAdditionalTime).not.toHaveBeenCalled();
    });

    it('should save up to 28 days and redirect to the task list', async () => {
      const {res} = await invoke('post', {body: {option: 'up-to-28-days'}});

      expect(mockSaveAdditionalTime).toHaveBeenCalledWith(expect.anything(), AdditionalTimeOptions.UP_TO_28_DAYS);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should save more than 28 days and redirect to the task list', async () => {
      const {res} = await invoke('post', {body: {option: 'more-than-28-days'}});

      expect(mockSaveAdditionalTime).toHaveBeenCalledWith(expect.anything(), AdditionalTimeOptions.MORE_THAN_28_DAYS);
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should return the error when saving additional time fails', async () => {
      const error = new Error('draft failure');
      mockSaveAdditionalTime.mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: 'more-than-28-days'}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
