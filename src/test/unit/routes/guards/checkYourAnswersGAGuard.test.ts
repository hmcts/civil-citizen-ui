import { YesNo } from 'common/form/models/yesNo';
import { AppRequest } from 'common/models/AppRequest';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { ApplicationType, ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { HearingArrangement, HearingTypeOptions } from 'common/models/generalApplication/hearingArrangement';
import { HearingContactDetails } from 'common/models/generalApplication/hearingContactDetails';
import { OrderJudge } from 'common/models/generalApplication/orderJudge';
import { RequestingReason } from 'common/models/generalApplication/requestingReason';
import { Request, Response } from 'express';
import * as utilityService from 'modules/utilityService';
import { checkYourAnswersGAGuard } from 'routes/guards/checkYourAnswersGAGuard';

jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('checkYourAnswersGAGuard', () => {
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

  it('should call next if GA journey is complete', async () => {
   //Given
   const claim = new Claim();
   claim.generalApplication = new GeneralApplication(
    new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING),
    YesNo.YES,
    YesNo.YES,
    YesNo.YES,
    new RequestingReason('test'),
    new OrderJudge('test'),
    new HearingArrangement(HearingTypeOptions.PERSON_AT_COURT, 'test'),
    new HearingContactDetails('test', 'test'),
     );
   jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);
   //When
   await checkYourAnswersGAGuard(req as AppRequest, res as Response, next);
   //Then
   expect(next).not.toHaveBeenCalled();
   expect(res.redirect).toHaveBeenCalled();
  });
  it('should call redirect GA journey is not complete', async () => {
    //Given
    const claim = new Claim();
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);
    //When
    await checkYourAnswersGAGuard(req as AppRequest, res as Response, next);
    //Then
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalled();
  });

});