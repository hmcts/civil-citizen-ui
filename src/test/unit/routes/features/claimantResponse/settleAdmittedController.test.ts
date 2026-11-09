import {Response} from 'express';
import settleAdmittedController from 'routes/features/claimantResponse/settleAdmittedController';
import {CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimantResponse, saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {PartialAdmission} from 'models/partialAdmission';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';
import {YesNo} from 'form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, createMockSession, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('services/features/claimantResponse/claimantResponseService');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

const viewPath = 'features/claimantResponse/settle-admitted';
const claimId = '12345';
const taskListUrl = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL);

const admittedClaim = (): Claim => {
  const claim = new Claim();
  claim.totalClaimAmount = 1000;
  claim.respondent1 = new Party();
  claim.respondent1.responseType = ResponseType.PART_ADMISSION;
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(200, 1000);
  return claim;
};

const invoke = async (method: 'get' | 'post', req: Record<string, unknown> = {}) => {
  const res = createMockResponse();
  const next = jest.fn();
  await getRouteHandler(settleAdmittedController, method, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL)(
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

describe('Claimant Response - Settle Part Admit Claim Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (generateRedisKey as jest.Mock).mockReturnValue(claimId);
    (getClaimById as jest.Mock).mockResolvedValue(admittedClaim());
    (getClaimantResponse as jest.Mock).mockResolvedValue(new ClaimantResponse());
    (saveClaimantResponse as jest.Mock).mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return settle claim page', async () => {
      const {res} = await invoke('get');

      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        admittedAmount: '£200',
      }));
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (getClaimById as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('get');

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    it('should return error on empty post', async () => {
      const {res} = await invoke('post');

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(saveClaimantResponse).not.toHaveBeenCalled();
    });

    it('should redirect to the claimant response task-list if option yes is selected', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.YES}});

      expect(saveClaimantResponse).toHaveBeenCalledWith(claimId, expect.objectContaining({option: YesNo.YES}), 'hasPartAdmittedBeenAccepted');
      expect(res.redirect).toHaveBeenCalledWith(taskListUrl);
    });

    it('should redirect to the claimant response task-list if option no is selected', async () => {
      const {res} = await invoke('post', {body: {option: YesNo.NO}});

      expect(saveClaimantResponse).toHaveBeenCalledWith(claimId, expect.objectContaining({option: YesNo.NO}), 'hasPartAdmittedBeenAccepted');
      expect(res.redirect).toHaveBeenCalledWith(taskListUrl);
    });

    it('should save the full-defence flag when the claim is a full defence', async () => {
      const claim = admittedClaim();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      (getClaimById as jest.Mock).mockResolvedValue(claim);

      const {res} = await invoke('post', {body: {option: YesNo.YES}});

      expect(saveClaimantResponse).toHaveBeenCalledWith(claimId, expect.objectContaining({option: YesNo.YES}), 'hasFullDefenceStatesPaidClaimSettled');
      expect(res.redirect).toHaveBeenCalledWith(taskListUrl);
    });

    it('should return status 500 when error thrown', async () => {
      const error = new Error('redis failure');
      (getClaimById as jest.Mock).mockRejectedValue(error);

      const {next} = await invoke('post', {body: {option: YesNo.YES}});

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
