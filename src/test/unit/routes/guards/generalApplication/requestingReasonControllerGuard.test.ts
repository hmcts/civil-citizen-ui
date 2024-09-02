import { GeneralApplication } from 'models/generalApplication/GeneralApplication';
import { ApplicationType, ApplicationTypeOption } from 'models/generalApplication/applicationType';
import { Response, NextFunction } from 'express';
import { Claim } from 'models/claim';
import * as utilityService from 'modules/utilityService';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {AppRequest} from 'models/AppRequest';
import {requestingReasonControllerGuard} from 'routes/guards/generalApplication/requestReasonControllerGuard';

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  getByIndexOrLast: jest.fn(),
}));

const MOCK_REQUEST = { params: { id: '123' }, query: {} } as unknown as AppRequest;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Requesting Reason Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should load claim application cost page', async () => {
    //Given
    const claim = new Claim();
    const applicationType = new ApplicationType(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT);
    claim.generalApplication = new GeneralApplication(applicationType);
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);
    jest.spyOn(generalApplicationService, 'getByIndexOrLast').mockReturnValue(applicationType);

    //When
    await requestingReasonControllerGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should not load claim application cost page', async () => {
    //Given
    const claim = new Claim();
    const applicationType = new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING);
    claim.generalApplication = new GeneralApplication(applicationType);
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);
    jest.spyOn(generalApplicationService, 'getByIndexOrLast').mockReturnValue(applicationType);

    //When
    await requestingReasonControllerGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
  it('should throw error', async () => {
    //Given
    const error = new Error('Error');
    jest.spyOn(utilityService, 'getClaimById').mockRejectedValue(error);
    //When
    await requestingReasonControllerGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
    expect(MOCK_NEXT).toHaveBeenLastCalledWith(error);
  });
});
