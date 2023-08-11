import {Request, Response, NextFunction} from 'express';
import {Claim} from 'models/claim';
import {CaseState} from 'common/form/models/claimDetails';
import {getClaimById, getRedisStoreForSession} from 'modules/utilityService';
import {claimantIntentGuard} from 'routes/guards/claimantIntentGuard';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

jest.mock('../../../../main/modules/utilityService');

const mockGetClaimById = getClaimById as jest.Mock;
const mockGetRedisStoreForSession = getRedisStoreForSession as jest.Mock;


const MOCK_REQUEST = {params: {id: '123'}} as unknown as Request;
const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Claimant Intention Guard', () => {
  it('should redirect if it`s empty claim', async () => {
    //Given
    const mockClaim = new Claim();
    mockGetClaimById.mockImplementation(async () => mockClaim);
    //When
    await claimantIntentGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
  });
  it('should allow claimant intent journey if claim state is AWAITING_APPLICANT_INTENTION', async () => {
    //Given
    const mockClaim = new Claim();
    mockClaim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
    mockGetClaimById.mockImplementation(async () => mockClaim);
    mockGetRedisStoreForSession.mockImplementation(() => new RedisStore({
      client: new Redis('test'),
    }));
    //When
    await claimantIntentGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
  });
});