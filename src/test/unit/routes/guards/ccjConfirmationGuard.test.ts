import {Request, Response, NextFunction} from 'express';
import {Claim} from 'models/claim';
import {ccjConfirmationGuard} from 'routes/guards/ccjConfirmationGuard';
import {getClaimById, getRedisStoreForSession} from 'modules/utilityService';
import config from 'config';
import nock from 'nock';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import {CaseState} from 'form/models/claimDetails';
import {PaidAmount} from 'models/claimantResponse/ccj/paidAmount';
import {YesNo} from 'form/models/yesNo';
import {ClaimantResponse} from 'models/claimantResponse';
import {CCJRequest} from 'models/claimantResponse/ccj/ccjRequest';
import {isJudgmentOnlineLive} from '../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');

const MOCK_REQUEST = {params: {id: '123'}} as unknown as Request;
const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('CCJ Guard', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (getRedisStoreForSession as jest.Mock).mockReturnValueOnce(new RedisStore({
      client: new Redis(),
    }));
  });
  it('should access ccj confirmation page', async () => {
    //Given
    const claim = new Claim();
    claim.ccdState = CaseState.PROCEEDS_IN_HERITAGE_SYSTEM;
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.ccjRequest = new CCJRequest();
    claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.YES, 1000, 9000);
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    (isJudgmentOnlineLive as jest.Mock).mockReturnValueOnce(false);
    jest.spyOn(claim, 'isCCJComplete').mockReturnValueOnce(true);
    //When
    await ccjConfirmationGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    // //Then
    // await expect(getClaimById).toHaveBeenCalled(); // Added just to buy time
    await expect(MOCK_NEXT).toHaveBeenCalled();
  });
  it('should access ccj confirmation page for JO', async () => {
    //Given
    const claim = new Claim();
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    (isJudgmentOnlineLive as jest.Mock).mockReturnValueOnce(true);
    jest.spyOn(claim, 'isCCJComplete').mockReturnValueOnce(false);
    //When
    await ccjConfirmationGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
  it('should redirect if ccj is not completed', async () => {
    //Given
    const claim = new Claim();
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    (isJudgmentOnlineLive as jest.Mock).mockReturnValueOnce(false);
    jest.spyOn(claim, 'isCCJComplete').mockReturnValueOnce(false);
    //When
    await ccjConfirmationGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
  });
  it('should throw an error', async () => {
    //Given
    const  error = new Error('Test error');
    (getClaimById as jest.Mock).mockResolvedValueOnce(error);
    //When
    await ccjConfirmationGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
});
