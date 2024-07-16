import { claimantIntentGuard } from 'routes/guards/claimantIntentGuard';
import { Request, Response } from 'express';
import { Claim } from 'common/models/claim';
import { getClaimById } from 'modules/utilityService';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { CLAIMANT_RESPONSE_CONFIRMATION_URL, DASHBOARD_CLAIMANT_URL } from 'routes/urls';
import * as draftStoreService from '../../../../main/modules/draft-store/draftStoreService';

jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
  deleteDraftClaimFromStore: jest.fn(),
}));

describe('claimantIntentGuard', () => {
  let req: Partial<Request>;
  let res: Partial<Response> & { redirect: jest.Mock };
  let next: jest.Mock;

  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const caseStoreData = new Claim();
 
  beforeEach(() => {
    req = {params: {id: '123'}, originalUrl: 'test' };
    res = { redirect: jest.fn() };
    next = jest.fn();
    mockGetCaseData.mockImplementation(async () => {
      return caseStoreData;
    });
  });

  it('should call next if isClaimantIntentionPending returns true', async () => {
    const claim: Partial<Claim> = {
      isClaimantIntentionPending: jest.fn().mockReturnValue(true),
    };
    (getClaimById as jest.Mock).mockResolvedValue(claim as Claim);
    await claimantIntentGuard(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should call next if isClaimantIntentionPending returns false but it`s claimant response confirmation page', async () => {
    const claim: Partial<Claim> = {
      isClaimantIntentionPending: jest.fn().mockReturnValue(false),
    };
    (getClaimById as jest.Mock).mockResolvedValue(claim as Claim);
    req.originalUrl = CLAIMANT_RESPONSE_CONFIRMATION_URL;
    await claimantIntentGuard(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should redirect if isClaimantIntentionPending returns false', async () => {
    const claim : Partial<Claim> = {
      isClaimantIntentionPending: jest.fn().mockReturnValue(false),
    };
    (getClaimById as jest.Mock).mockResolvedValue(claim as Claim);
    const redirectUrl = constructResponseUrlWithIdParams(
      req.params.id,
      DASHBOARD_CLAIMANT_URL,
    );
    await claimantIntentGuard(req as Request, res as Response, next);
    expect(res.redirect).toHaveBeenCalledWith(redirectUrl);
  });

  it('should pass the error to next if there is an exception', async () => {
    const error = new Error('Test error');
    (getClaimById as jest.Mock).mockResolvedValue(error);
    await claimantIntentGuard(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
