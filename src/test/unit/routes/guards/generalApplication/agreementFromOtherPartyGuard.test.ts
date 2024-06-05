import { CaseRole } from 'form/models/caseRoles';
import { GeneralApplication } from 'models/generalApplication/GeneralApplication';
import { ApplicationType, ApplicationTypeOption } from 'models/generalApplication/applicationType';
import { Response, NextFunction } from 'express';
import { Claim } from 'models/claim';
import * as utilityService from 'modules/utilityService';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {agreementFromOtherPartyGuard} from 'routes/guards/generalApplication/agreementFromOtherPartyGuard';
import {AppRequest} from 'models/AppRequest';

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

describe('Order Judge Guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should load add another application page', async () => {
    //Given
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    const applicationType = new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING);
    claim.generalApplication = new GeneralApplication(applicationType);
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);
    jest.spyOn(generalApplicationService, 'getByIndexOrLast').mockReturnValue(applicationType);

    //When
    await agreementFromOtherPartyGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should not load add another application page', async () => {
    //Given
    const claim = new Claim();
    claim.caseRole = CaseRole.CLAIMANT;
    const applicationType = new ApplicationType(ApplicationTypeOption.SETTLE_BY_CONSENT);
    claim.generalApplication = new GeneralApplication(applicationType);
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);
    jest.spyOn(generalApplicationService, 'getByIndexOrLast').mockReturnValue(applicationType);

    //When
    await agreementFromOtherPartyGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
  it('should not load add another application page', async () => {
    //Given
    const claim = new Claim();
    claim.caseRole = CaseRole.DEFENDANT;
    const applicationType = new ApplicationType(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT);
    claim.generalApplication = new GeneralApplication(applicationType);
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);
    jest.spyOn(generalApplicationService, 'getByIndexOrLast').mockReturnValue(applicationType);
    //When
    await agreementFromOtherPartyGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });
  it('should throw error', async () => {
    //Given
    const error = new Error('Error');
    jest.spyOn(utilityService, 'getClaimById').mockRejectedValue(error);
    //When
    await agreementFromOtherPartyGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).not.toHaveBeenCalled();
    expect(MOCK_NEXT).toHaveBeenLastCalledWith(error);
  });
});
