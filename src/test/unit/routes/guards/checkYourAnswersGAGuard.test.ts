import { YesNo } from 'common/form/models/yesNo';
import { AppRequest } from 'common/models/AppRequest';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { ApplicationType, ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { HearingArrangement, HearingTypeOptions } from 'common/models/generalApplication/hearingArrangement';
import { HearingContactDetails } from 'common/models/generalApplication/hearingContactDetails';
import { OrderJudge } from 'common/models/generalApplication/orderJudge';
import { RequestingReason } from 'common/models/generalApplication/requestingReason';
import {NextFunction, Response} from 'express';
//import * as utilityService from 'modules/utilityService';
import { checkYourAnswersGAGuard } from 'routes/guards/checkYourAnswersGAGuard';
//import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {
  UnavailableDatePeriodGaHearing,
  UnavailableDatesGaHearing,
} from 'models/generalApplication/unavailableDatesGaHearing';
import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {CURRENT_DAY, CURRENT_MONTH, CURRENT_YEAR} from '../../../utils/dateUtils';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {StatementOfTruthForm} from 'models/generalApplication/statementOfTruthForm';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

jest.mock('../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/draft-store');

//const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const MOCK_REQUEST = { params: { id: '123' } } as unknown as AppRequest;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Check your Answers GA Guard', () => {
  it('should call next if GA journey is complete', async () => {
    //Given
    const claim = new Claim();
    const unavailableDates =
      new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
        {'day': CURRENT_DAY.toString(), 'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()});

    claim.generalApplication = new GeneralApplication(
      new ApplicationType(ApplicationTypeOption.SET_ASIDE_JUDGEMENT),
      YesNo.YES,
      YesNo.YES,
      new RequestingReason('test'),
      new OrderJudge('test'),
      new UnavailableDatesGaHearing([unavailableDates]),
      new HearingArrangement(HearingTypeOptions.PERSON_AT_COURT, 'test'),
      new HearingContactDetails('test', 'test'),
      new GaResponse(),
      new UploadGAFiles(),
      new StatementOfTruthForm(false, ''),
      YesNo.NO,
    );

    // Mock getClaimById
    //jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);
    mockGetCaseData.mockImplementation(async () => claim);
    //When
    await checkYourAnswersGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT()).toHaveBeenCalled();
  });

/*  it('should call redirect GA journey is not complete', async () => {
    //Given
    const claim = new Claim();
    jest.spyOn(utilityService, 'getClaimById').mockResolvedValueOnce(claim);
    //When
    await checkYourAnswersGAGuard(req as AppRequest, res as Response, next);
    //Then
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalled();
  });*/

});
