import { isGaForLipsEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import { Claim } from 'common/models/claim';
import { Request, Response } from 'express';
import * as utilityService from 'modules/utilityService';
import { isGAForLiPEnabled } from 'routes/guards/generalAplicationGuard';

jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));
jest.mock('../../../../main/modules/draft-store/gaHwFeesDraftStore', () => ({
  saveDraftGAHWFDetails: jest.fn(),
  getDraftGAHWFDetails: jest.fn(),
}));
describe('GAFlagGuard', () => {
  let req: Partial<Request>;
  let res: Partial<Response> & { redirect: jest.Mock };
  let next: jest.Mock;
  beforeEach(() => {
    req = { params: { id: '123' }, originalUrl: 'test' };
    res = { redirect: jest.fn() };
    next = jest.fn();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should call next if isGAFlag enabled returns true', async () => {
    (isGaForLipsEnabled as jest.Mock).mockReturnValueOnce(true);
    await isGAForLiPEnabled(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
  it('should call redirect if isGAFlag  returns false', async () => {
    (isGaForLipsEnabled as jest.Mock).mockReturnValueOnce(false);
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce({ isClaimant: () => true } as Claim);
    await isGAForLiPEnabled(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalled();
  });

});
