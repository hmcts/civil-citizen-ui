import {NextFunction, Request, Response} from 'express';
import {isQueryManagementEnabled} from '../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {contactUsGuard} from 'routes/guards/contactUsGuard';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {QM_START_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {CivilServiceClient} from 'client/civilServiceClient';

jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');

const mockIsQueryManagementEnabled = isQueryManagementEnabled as jest.Mock;

const MOCK_REQUEST = {
  params: {
    id: '123',
  },
  path: '/case/123',
} as unknown as Request;

const MOCK_RESPONSE = {
  redirect: jest.fn(),
  locals: {},
} as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Contact us for help', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MOCK_RESPONSE.locals = {};
  });
  it('should populate request fields when QM is on', async () => {
    //Given
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });

    mockIsQueryManagementEnabled.mockImplementation(async () => true);

    //When
    await contactUsGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_RESPONSE.locals.showCreateQuery).toBeTruthy();
    expect(MOCK_RESPONSE.locals.isQMFlagEnabled).toBeTruthy();
    expect(MOCK_RESPONSE.locals.disableSendMessage).toBeTruthy();
    expect(MOCK_RESPONSE.locals.qmStartUrl).toEqual(constructResponseUrlWithIdParams('123', QM_START_URL)+'?linkFrom=start');
  });

  it('should not populate request fields when case is PENDING_CASE_ISSUED', async () => {
    //Given
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.PENDING_CASE_ISSUED;
        return claim;
      });

    mockIsQueryManagementEnabled.mockImplementation(async () => true);

    //When
    await contactUsGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_RESPONSE.locals.showCreateQuery).toBeFalsy();
    expect(MOCK_RESPONSE.locals.isQMFlagEnabled).toBeFalsy();
    expect(MOCK_RESPONSE.locals.disableSendMessage).toBeFalsy();
    expect(MOCK_RESPONSE.locals.qmStartUrl).toBeUndefined();
  });

  it('should not populate request fields when QM LIP is off', async () => {
    //Given
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.PENDING_CASE_ISSUED;
        return claim;
      });
    mockIsQueryManagementEnabled.mockImplementation(async () => false);

    //When
    await contactUsGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_RESPONSE.locals.showCreateQuery).toBeFalsy();
    expect(MOCK_RESPONSE.locals.isQMFlagEnabled).toBeFalsy();
    expect(MOCK_RESPONSE.locals.disableSendMessage).toBeFalsy();
    expect(MOCK_RESPONSE.locals.qmStartUrl).toBeUndefined();
  });

  it('should not populate request fields when is eligibility', async () => {
    //Given
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
        return claim;
      });

    const whitelistRequest = {
      params: {
        id: '123',
      },
      path: '/eligibility/start',
    } as unknown as Request;
    mockIsQueryManagementEnabled.mockImplementation(async () => false);

    //When
    await contactUsGuard(whitelistRequest, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_RESPONSE.locals.showCreateQuery).toBeFalsy();
    expect(MOCK_RESPONSE.locals.isQMFlagEnabled).toBeFalsy();
    expect(MOCK_RESPONSE.locals.disableSendMessage).toBeFalsy();
    expect(MOCK_RESPONSE.locals.qmStartUrl).toBeUndefined();
  });

  it('should not populate request fields when is first-contact', async () => {
    //Given
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.CASE_SETTLED;
        return claim;
      });

    const whitelistRequest = {
      params: {
        id: '123',
      },
      path: '/first-contact/start',
    } as unknown as Request;
    mockIsQueryManagementEnabled.mockImplementation(async () => false);

    //When
    await contactUsGuard(whitelistRequest, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_RESPONSE.locals.showCreateQuery).toBeFalsy();
    expect(MOCK_RESPONSE.locals.isQMFlagEnabled).toBeFalsy();
    expect(MOCK_RESPONSE.locals.disableSendMessage).toBeFalsy();
    expect(MOCK_RESPONSE.locals.qmStartUrl).toBeUndefined();
  });

  it('should not populate request fields when is testing-support', async () => {
    //Given
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.CASE_SETTLED;
        return claim;
      });

    const whitelistRequest = {
      params: {
        id: '123',
      },
      path: '/testing-support/start',
    } as unknown as Request;
    mockIsQueryManagementEnabled.mockImplementation(async () => false);

    //When
    await contactUsGuard(whitelistRequest, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_RESPONSE.locals.showCreateQuery).toBeFalsy();
    expect(MOCK_RESPONSE.locals.isQMFlagEnabled).toBeFalsy();
    expect(MOCK_RESPONSE.locals.disableSendMessage).toBeFalsy();
    expect(MOCK_RESPONSE.locals.qmStartUrl).toBeUndefined();
  });

  it('should not populate request fields when is claim', async () => {
    //Given
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.CASE_SETTLED;
        return claim;
      });

    const whitelistRequest = {
      params: {
        id: '123',
      },
      path: '/claim/start',
    } as unknown as Request;
    mockIsQueryManagementEnabled.mockImplementation(async () => false);

    //When
    await contactUsGuard(whitelistRequest, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_RESPONSE.locals.showCreateQuery).toBeFalsy();
    expect(MOCK_RESPONSE.locals.isQMFlagEnabled).toBeFalsy();
    expect(MOCK_RESPONSE.locals.disableSendMessage).toBeFalsy();
    expect(MOCK_RESPONSE.locals.qmStartUrl).toBeUndefined();
  });

  it('should not populate request fields when the path url contains at second position a string', async () => {
    //Given
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockImplementation(async () => {
        const claim = new Claim();
        claim.ccdState = CaseState.CASE_SETTLED;
        return claim;
      });

    const whitelistRequest = {
      params: {
        id: '123',
      },
      path: '/test/test/start',
    } as unknown as Request;
    mockIsQueryManagementEnabled.mockImplementation(async () => false);

    //When
    await contactUsGuard(whitelistRequest, MOCK_RESPONSE, MOCK_NEXT);

    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
    expect(MOCK_RESPONSE.locals.showCreateQuery).toBeFalsy();
    expect(MOCK_RESPONSE.locals.isQMFlagEnabled).toBeFalsy();
    expect(MOCK_RESPONSE.locals.disableSendMessage).toBeFalsy();
    expect(MOCK_RESPONSE.locals.qmStartUrl).toBeUndefined();
  });

});
