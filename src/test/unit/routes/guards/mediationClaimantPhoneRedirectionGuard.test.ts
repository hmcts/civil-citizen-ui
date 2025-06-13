import {Request, Response, NextFunction} from 'express';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {mediationClaimantPhoneRedirectionGuard} from 'routes/guards/mediationClaimantPhoneRedirectionGuard';
import {PartyPhone} from 'models/PartyPhone';
import {CaseRole} from 'form/models/caseRoles';
import {Party} from 'models/party';

jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/draft-store');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const MOCK_RESPONSE = {redirect: jest.fn()} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('mediation Claimant Phone Redirection Guard', () => {
  it('should redirect to MEDIATION CLAIMANT PHONE URL when phone is undefined', async () => {
    //Given
    const MOCK_REQUEST = {params: {id: '123'}, method: 'GET'} as unknown as Request;
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.applicant1 = new Party();
      claim.caseRole = CaseRole.APPLICANTSOLICITORONE;
      return claim;
    });
    //When
    await mediationClaimantPhoneRedirectionGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).not.toHaveBeenCalled();

  });

  it('should redirect to next page when is post method', async () => {
    //Given
    const MOCK_REQUEST = {params: {id: '123', method: 'POST'}} as unknown as Request;
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.applicant1.partyPhone = new PartyPhone('01234567890');
      claim.caseRole = CaseRole.APPLICANTSOLICITORONE;
      return claim;
    });
    //When
    await mediationClaimantPhoneRedirectionGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();

  });

  it('should redirect to next page when is Defendant', async () => {
    //Given
    const MOCK_REQUEST = {params: {id: '123', method: 'POST'}} as unknown as Request;
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.applicant1.partyPhone = new PartyPhone('01234567890');
      claim.caseRole = CaseRole.DEFENDANT;
      return claim;
    });
    //When
    await mediationClaimantPhoneRedirectionGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();

  });

  it('should redirect to next page when is not undefined', async () => {
    //Given
    const MOCK_REQUEST = {params: {id: '123', method: 'POST'}} as unknown as Request;
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.applicant1.partyPhone = new PartyPhone('01234567890');
      claim.caseRole = CaseRole.DEFENDANT;
      return claim;
    });
    //When
    await mediationClaimantPhoneRedirectionGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();

  });
});
