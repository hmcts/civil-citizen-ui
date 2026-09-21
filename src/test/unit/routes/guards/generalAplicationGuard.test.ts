import {isGaForLipsEnabled} from 'app/auth/launchdarkly/launchDarklyClient';
import {Claim} from 'common/models/claim';
import {Request, Response} from 'express';
import * as utilityService from 'modules/utilityService';
import {isGAForLiPEnabled} from 'routes/guards/generalAplicationGuard';
import {CANCEL_URL} from 'routes/urls';

jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/utilityService', () => ({
  getRedisStoreForSession: jest.fn(),
  getClaimById: jest.fn(),
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
    req = {params: {id: '123'}};
    res = {redirect: jest.fn()};
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next when GaForLips is enabled', async () => {
    (isGaForLipsEnabled as jest.Mock).mockResolvedValueOnce(true);
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce({generalApplications: []} as unknown as Claim);

    await isGAForLiPEnabled(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('should redirect when GaForLips is disabled and there is no existing general application', async () => {
    (isGaForLipsEnabled as jest.Mock).mockResolvedValueOnce(false);
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce({generalApplications: []} as unknown as Claim);

    await isGAForLiPEnabled(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(CANCEL_URL.replace(':id', '123').replace(':propertyName', 'generalApplication'));
  });

  it('should call next when GaForLips is disabled but an existing general application is accessible', async () => {
    (isGaForLipsEnabled as jest.Mock).mockResolvedValueOnce(false);
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce({
      generalApplications: [{id: 'test'}],
    } as unknown as Claim);

    await isGAForLiPEnabled(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
