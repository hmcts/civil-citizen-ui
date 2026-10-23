import {Response} from 'express';
import youHavePaidLessController from 'routes/features/response/admission/fullRejection/youHavePaidLessController';
import {CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService');

const viewPath = 'features/response/admission/fullRejection/you-have-paid-less';
const claimId = '12345';

const storedClaim = (): Claim => {
  const claim = new Claim();
  claim.applicant1 = {
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      title: 'Mr',
      firstName: 'Joe',
      lastName: 'Bloggs',
    },
  };
  return claim;
};

const invoke = async (method: 'get' | 'post') => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(youHavePaidLessController, method, CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL)(
    {
      params: {id: claimId},
      body: {},
      query: {},
      cookies: {},
      session: createMockSession({user: {id: 'user-1'}}),
    } as unknown as AppRequest,
    res as unknown as Response,
    next,
  );
  return {res, next};
};

describe('You Have Paid Less Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(storedClaim());
  });

  describe('on GET', () => {
    it('should render the claimant name', async () => {
      const claim = storedClaim();
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, {
        claimantName: claim.getClaimantFullName(),
      });
    });

    it('should return the error when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      (getCaseDataFromStore as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should redirect to the task list', async () => {
      const {res} = await invoke('post');

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, RESPONSE_TASK_LIST_URL));
    });
  });
});
