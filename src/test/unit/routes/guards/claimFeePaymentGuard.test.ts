import {NextFunction, Response} from 'express';
import {Claim} from 'models/claim';
import {getClaimById, getRedisStoreForSession} from 'modules/utilityService';
import config from 'config';
import nock from 'nock';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import {claimFeePaymentGuard} from 'routes/guards/claimFeePaymentGuard';
import {AppRequest} from 'models/AppRequest';
import {checkIfClaimFeeHasChanged} from 'services/features/claim/amount/checkClaimFee';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('../../../../main/services/features/claim/amount/checkClaimFee', () => ({
  checkIfClaimFeeHasChanged: jest.fn(),
}));

const MOCK_REQUEST = {params: {id: '123'}} as unknown as AppRequest;
const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Claim Fee Payment Guard', () => {
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
  it('should access claim fee payment page', async () => {
    //Given
    const claim = new Claim();
    claim.claimFee = {
      calculatedAmountInPence: 123,
      code: 'code',
      version: 1,
    };
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    (checkIfClaimFeeHasChanged as jest.Mock).mockResolvedValueOnce(false);

    //When
    await claimFeePaymentGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
  it('should redirect if claim fee has changed', async () => {
    //Given
    const claim = new Claim();
    claim.draftClaimCreatedAt = new Date();
    (getClaimById as jest.Mock).mockResolvedValueOnce(claim);
    (checkIfClaimFeeHasChanged as jest.Mock).mockResolvedValueOnce(true);
    //When
    await claimFeePaymentGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
  });
  it('should throw an error', async () => {
    //Given
    const  error = new Error('Test error');
    (getClaimById as jest.Mock).mockResolvedValueOnce(error);
    //When
    await claimFeePaymentGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });
});
