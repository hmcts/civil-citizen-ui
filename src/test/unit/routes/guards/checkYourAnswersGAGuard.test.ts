import { YesNo } from 'common/form/models/yesNo';
import { Claim } from 'common/models/claim';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { ApplicationType, ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { HearingArrangement, HearingTypeOptions } from 'common/models/generalApplication/hearingArrangement';
import { HearingContactDetails } from 'common/models/generalApplication/hearingContactDetails';
import { OrderJudge } from 'common/models/generalApplication/orderJudge';
import { RequestingReason } from 'common/models/generalApplication/requestingReason';
import {Request, NextFunction, Response} from 'express';
import { checkYourAnswersGAGuard } from 'routes/guards/checkYourAnswersGAGuard';
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
import {GaHelpWithFees} from 'common/models/generalApplication/gaHelpWithFees';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericYesNo} from 'form/models/genericYesNo';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/draft-store');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const MOCK_REQUEST = { params: { id: '123' } } as unknown as Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;

describe('Check your Answers GA Guard', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
      new GaHelpWithFees(),
      YesNo.NO,
      new UploadGAFiles(),
      new GenericYesNo(YesNo.NO, 'no'),
    );
    mockGetCaseData.mockImplementation(async () => claim);
    //When
    await checkYourAnswersGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should call next if GA journey is complete for Vary Judgement', async () => {
    //Given
    const claim = new Claim();
    const unavailableDates =
      new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
        {'day': CURRENT_DAY.toString(), 'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()});
    const n245Form = new FileUpload();
    n245Form.fieldname = 'n245';
    n245Form.size = 12;

    claim.generalApplication = new GeneralApplication(
      new ApplicationType(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT),
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
      new GaHelpWithFees(),
      YesNo.NO,
      new UploadGAFiles(n245Form),
      new GenericYesNo(YesNo.NO, 'no'),
    );
    mockGetCaseData.mockImplementation(async () => claim);
    //When
    await checkYourAnswersGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should call next if GA journey is complete for RELIEF_FROM_SANCTIONS', async () => {
    //Given
    const claim = new Claim();
    const unavailableDates =
      new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
        {'day': CURRENT_DAY.toString(), 'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()});

    claim.generalApplication = new GeneralApplication(
      new ApplicationType(ApplicationTypeOption.RELIEF_FROM_SANCTIONS),
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
      new GaHelpWithFees(),
      YesNo.NO,
      new UploadGAFiles(),
      new GenericYesNo(YesNo.YES),
    );
    mockGetCaseData.mockImplementation(async () => claim);
    //When
    await checkYourAnswersGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should call next if GA journey is complete for SETTLE_BY_CONSENT', async () => {
    //Given
    const claim = new Claim();
    const unavailableDates =
      new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
        {'day': CURRENT_DAY.toString(), 'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()});

    claim.generalApplication = new GeneralApplication(
      new ApplicationType(ApplicationTypeOption.SETTLE_BY_CONSENT),
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
      new GaHelpWithFees(),
      YesNo.NO,
      new UploadGAFiles(),
      new GenericYesNo(YesNo.YES),
    );
    mockGetCaseData.mockImplementation(async () => claim);
    //When
    await checkYourAnswersGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should call next if GA journey is complete for Summary Judgement', async () => {
    //Given
    const claim = new Claim();
    const unavailableDates =
      new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
        {'day': CURRENT_DAY.toString(), 'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()});

    claim.generalApplication = new GeneralApplication(
      new ApplicationType(ApplicationTypeOption.SUMMARY_JUDGMENT),
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
      new GaHelpWithFees(),
      YesNo.NO,
      new UploadGAFiles(),
      new GenericYesNo(YesNo.YES),
    );
    mockGetCaseData.mockImplementation(async () => claim);
    //When
    await checkYourAnswersGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should not call next if GA journey is incomplete', async () => {
    //Given
    const claim = new Claim();
    const unavailableDates =
      new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
        {'day': CURRENT_DAY.toString(), 'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()});

    claim.generalApplication = new GeneralApplication(
      new ApplicationType(),
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
      new GaHelpWithFees(),
      YesNo.NO,
      new UploadGAFiles(),
      new GenericYesNo(YesNo.YES),
    );
    mockGetCaseData.mockImplementation(async () => claim);
    //When
    await checkYourAnswersGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

});
