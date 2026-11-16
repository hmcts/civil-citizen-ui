import {Response} from 'express';
import newResponseDeadlineController from 'routes/features/response/responseDeadline/newResponseDeadlineController';
import {AGREED_TO_MORE_TIME_URL, NEW_RESPONSE_DEADLINE_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {
  getClaimWithExtendedResponseDeadline,
  submitExtendedResponseDeadline,
} from 'services/features/response/responseDeadline/extendResponseDeadlineService';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ResponseDeadline} from 'form/models/responseDeadline';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../utils/getRouteHandler';

jest.mock('services/features/response/responseDeadline/extendResponseDeadlineService');

const viewPath = 'features/response/responseDeadline/new-response-deadline';
const claimId = '1234';
const extendedDate = new Date(2022, 9, 31);

const storedClaim = (): Claim => {
  const claim = new Claim();
  claim.applicant1 = {
    partyDetails: {
      title: 'Mr',
      firstName: 'James',
      lastName: 'Bond',
    },
    type: PartyType.INDIVIDUAL,
  };
  claim.responseDeadline = Object.assign(new ResponseDeadline(), {
    agreedResponseDeadline: extendedDate,
    calculatedResponseDeadline: extendedDate,
  });
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(newResponseDeadlineController, method, NEW_RESPONSE_DEADLINE_URL)(
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

describe('Response - New response deadline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getClaimWithExtendedResponseDeadline as jest.Mock).mockResolvedValue(storedClaim());
    (submitExtendedResponseDeadline as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render the calculated response deadline', async () => {
      const claim = storedClaim();
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claimantName: claim.getClaimantFullName(),
        responseDeadline: formatDateToFullDate(extendedDate, undefined),
        backUrl: constructResponseUrlWithIdParams(claimId, AGREED_TO_MORE_TIME_URL),
        isReleaseTwoEnabled: true,
      }));
    });

    it('should return the error when the extended deadline cannot be loaded', async () => {
      const error = new Error('No extended response deadline found');
      (getClaimWithExtendedResponseDeadline as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should submit the extended deadline and redirect to the task list', async () => {
      const {res} = await invoke('post');

      expect(submitExtendedResponseDeadline).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });

    it('should return the error when submitting the deadline fails', async () => {
      const error = new Error('error');
      (submitExtendedResponseDeadline as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post');

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
