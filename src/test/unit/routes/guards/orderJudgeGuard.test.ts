import {CaseRole} from 'common/form/models/caseRoles';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {Request, Response, NextFunction} from 'express';
import {Claim} from 'models/claim';
import {getClaimById} from 'modules/utilityService';
import {orderJudgeGuard} from 'routes/guards/orderJudgeGuard';

const mockClaim = getClaimById as jest.Mock;
const MOCK_REQUEST = { params: { id: '123' } } as unknown as Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('Order Judge Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should load order judge page', async () => {
    //Given
    mockClaim.mockImplementation(async () => {
      const claim = new Claim();
      claim.caseRole = CaseRole.CLAIMANT;
      const applicationType = new ApplicationType(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT);
      claim.generalApplication = new GeneralApplication(applicationType);
      return claim;
    });
    await orderJudgeGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
    //When
  });
  it('should not load order judge page', async () => {
    //Given
    mockClaim.mockImplementation(async () => {
      const claim = new Claim();
      claim.caseRole = CaseRole.DEFENDANT;
      const applicationType = new ApplicationType(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT);
      claim.generalApplication = new GeneralApplication(applicationType);
      return claim;
    });
    //When
    await orderJudgeGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
  it('should throw error', async () => {
    //Given
    const error = new Error('Error');
    mockClaim.mockImplementation(() => {
      throw error;
    });
    //When
    await orderJudgeGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
    expect(MOCK_NEXT).toHaveBeenLastCalledWith(error);
  });
});
