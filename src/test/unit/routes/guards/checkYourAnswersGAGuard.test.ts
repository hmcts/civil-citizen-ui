import {YesNo} from 'common/form/models/yesNo';
import {Claim} from 'common/models/claim';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {HearingArrangement, HearingTypeOptions} from 'common/models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'common/models/generalApplication/hearingContactDetails';
import {OrderJudge} from 'common/models/generalApplication/orderJudge';
import {RequestingReason} from 'common/models/generalApplication/requestingReason';
import {NextFunction, Request, Response} from 'express';
import {checkYourAnswersGAGuard} from 'routes/guards/checkYourAnswersGAGuard';
import {APPLICATION_TYPE_URL} from 'routes/urls';
import {
  UnavailableDatePeriodGaHearing,
  UnavailableDatesGaHearing,
} from 'models/generalApplication/unavailableDatesGaHearing';
import {UnavailableDateType} from 'models/directionsQuestionnaire/hearing/unavailableDates';
import {CURRENT_DAY, CURRENT_MONTH, CURRENT_YEAR} from '../../../utils/dateUtils';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {StatementOfTruthForm} from 'models/generalApplication/statementOfTruthForm';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {GaHelpWithFees} from 'common/models/generalApplication/gaHelpWithFees';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {ClaimFeeData} from 'models/civilClaimResponse';
import {
  applicationTypeErrorUrl,
  duplicateApplicationTypeErrorUrl,
} from 'routes/guards/generalApplication/applicationTypeGuard';

jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreService');

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
    const mockClaimFee: ClaimFeeData = {
      calculatedAmountInPence: 5000,
      code: '123',
      version: 1,
    };

    claim.generalApplication = new GeneralApplication(
      new ApplicationType(ApplicationTypeOption.SET_ASIDE_JUDGEMENT),
      YesNo.YES,
      YesNo.YES,
      new RequestingReason('test'),
      new OrderJudge('test'),

      new UnavailableDatesGaHearing([unavailableDates]),
      new HearingArrangement(HearingTypeOptions.PERSON_AT_COURT, 'test'),
      new HearingContactDetails('test', 'test'),
      new UploadGAFiles(),
      new StatementOfTruthForm(false, ''),
      new GaHelpWithFees(),
      YesNo.NO,
      new UploadGAFiles(),
      new GenericYesNo(YesNo.NO, 'no'),
      mockClaimFee,
      undefined,
      YesNo.YES,
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

    const mockClaimFee: ClaimFeeData = {
      calculatedAmountInPence: 5000,
      code: '123',
      version: 1,
    };

    claim.generalApplication = new GeneralApplication(
      new ApplicationType(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT),
      YesNo.YES,
      YesNo.YES,
      new RequestingReason('test'),
      new OrderJudge('test'),
      new UnavailableDatesGaHearing([unavailableDates]),
      new HearingArrangement(HearingTypeOptions.PERSON_AT_COURT, 'test'),
      new HearingContactDetails('test', 'test'),
      new UploadGAFiles(),
      new StatementOfTruthForm(false, ''),
      new GaHelpWithFees(),
      YesNo.NO,
      new UploadGAFiles(n245Form),
      new GenericYesNo(YesNo.NO, 'no'),
      mockClaimFee,
      undefined,
      YesNo.YES,
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

    const mockClaimFee: ClaimFeeData = {
      calculatedAmountInPence: 5000,
      code: '123',
      version: 1,
    };

    claim.generalApplication = new GeneralApplication(
      new ApplicationType(ApplicationTypeOption.RELIEF_FROM_SANCTIONS),
      YesNo.YES,
      YesNo.YES,
      new RequestingReason('test'),
      new OrderJudge('test'),
      new UnavailableDatesGaHearing([unavailableDates]),
      new HearingArrangement(HearingTypeOptions.PERSON_AT_COURT, 'test'),
      new HearingContactDetails('test', 'test'),
      new UploadGAFiles(),
      new StatementOfTruthForm(false, ''),
      new GaHelpWithFees(),
      YesNo.NO,
      new UploadGAFiles(),
      new GenericYesNo(YesNo.YES),
      mockClaimFee,
      undefined,
      YesNo.YES,
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
    const mockClaimFee: ClaimFeeData = {
      calculatedAmountInPence: 5000,
      code: '123',
      version: 1,
    };
    claim.generalApplication = new GeneralApplication(
      new ApplicationType(ApplicationTypeOption.SETTLE_BY_CONSENT),
      YesNo.YES,
      YesNo.YES,
      new RequestingReason('test'),
      new OrderJudge('test'),
      new UnavailableDatesGaHearing([unavailableDates]),
      new HearingArrangement(HearingTypeOptions.PERSON_AT_COURT, 'test'),
      new HearingContactDetails('test', 'test'),
      new UploadGAFiles(),
      new StatementOfTruthForm(false, ''),
      new GaHelpWithFees(),
      YesNo.NO,
      new UploadGAFiles(),
      new GenericYesNo(YesNo.YES),
      mockClaimFee,
      undefined,
      YesNo.YES,
    );
    mockGetCaseData.mockImplementation(async () => claim);
    //When
    await checkYourAnswersGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should call next if GA journey is complete for multiple application type', async () => {
    //Given
    const claim = new Claim();
    const unavailableDates =
      new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
        {'day': CURRENT_DAY.toString(), 'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()});
    const mockClaimFee: ClaimFeeData = {
      calculatedAmountInPence: 5000,
      code: '123',
      version: 1,
    };

    claim.generalApplication = new GeneralApplication(
      null,
      YesNo.YES,
      YesNo.YES,
      new RequestingReason('test'),
      new OrderJudge('test'),
      new UnavailableDatesGaHearing([unavailableDates]),
      new HearingArrangement(HearingTypeOptions.PERSON_AT_COURT, 'test'),
      new HearingContactDetails('test', 'test'),
      new UploadGAFiles(),
      new StatementOfTruthForm(false, ''),
      new GaHelpWithFees(),
      YesNo.NO,
      new UploadGAFiles(),
      new GenericYesNo(YesNo.YES),
      mockClaimFee,
      undefined,
      YesNo.YES,
    );
    claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.STAY_THE_CLAIM), new ApplicationType(ApplicationTypeOption.STRIKE_OUT)];
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
    const mockClaimFee: ClaimFeeData = {
      calculatedAmountInPence: 5000,
      code: '123',
      version: 1,
    };

    claim.generalApplication = new GeneralApplication(
      null,
      YesNo.YES,
      YesNo.YES,
      new RequestingReason('test'),
      new OrderJudge('test'),
      new UnavailableDatesGaHearing([unavailableDates]),
      new HearingArrangement(HearingTypeOptions.PERSON_AT_COURT, 'test'),
      new HearingContactDetails('test', 'test'),
      new UploadGAFiles(),
      new StatementOfTruthForm(false, ''),
      new GaHelpWithFees(),
      YesNo.NO,
      new UploadGAFiles(),
      new GenericYesNo(YesNo.YES),
      mockClaimFee,
      undefined,
      YesNo.YES,
    );
    claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.SUMMARY_JUDGEMENT)];
    mockGetCaseData.mockImplementation(async () => claim);
    //When
    await checkYourAnswersGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();
  });

  it('should redirect to invalid application type index before submitting a multi-application GA', async () => {
    //Given
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    claim.generalApplication.applicationTypes = [
      new ApplicationType(ApplicationTypeOption.EXTEND_TIME),
      new ApplicationType(ApplicationTypeOption.STRIKE_OUT),
      new ApplicationType(ApplicationTypeOption.OTHER_OPTION),
    ];
    mockGetCaseData.mockImplementation(async () => claim);
    //When
    await checkYourAnswersGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(APPLICATION_TYPE_URL.replace(':id', '123') + '?index=2');
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should redirect to duplicate application type error before submitting a multi-application GA', async () => {
    //Given
    const claim = new Claim();
    claim.generalApplication = new GeneralApplication();
    claim.generalApplication.applicationTypes = [
      new ApplicationType(ApplicationTypeOption.VARY_ORDER),
      new ApplicationType(ApplicationTypeOption.EXTEND_TIME),
      new ApplicationType(ApplicationTypeOption.VARY_ORDER),
    ];
    mockGetCaseData.mockImplementation(async () => claim);
    //When
    await checkYourAnswersGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(duplicateApplicationTypeErrorUrl('123', 2));
    expect(MOCK_NEXT).not.toHaveBeenCalled();
  });

  it('should not call next if GA journey is incomplete', async () => {
    //Given
    const claim = new Claim();
    const unavailableDates =
      new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE,
        {'day': CURRENT_DAY.toString(), 'month': CURRENT_MONTH.toString(), 'year': CURRENT_YEAR.toString()});
    const mockClaimFee: ClaimFeeData = {
      calculatedAmountInPence: 5000,
      code: '123',
      version: 1,
    };

    claim.generalApplication = new GeneralApplication(
      null,
      YesNo.YES,
      YesNo.YES,
      new RequestingReason('test'),
      new OrderJudge('test'),
      new UnavailableDatesGaHearing([unavailableDates]),
      new HearingArrangement(HearingTypeOptions.PERSON_AT_COURT, 'test'),
      new HearingContactDetails('test', 'test'),
      new UploadGAFiles(),
      new StatementOfTruthForm(false, ''),
      new GaHelpWithFees(),
      YesNo.NO,
      new UploadGAFiles(),
      new GenericYesNo(YesNo.YES),
      mockClaimFee,
    );
    mockGetCaseData.mockImplementation(async () => claim);
    //When
    await checkYourAnswersGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalledWith(applicationTypeErrorUrl('123'));
  });
});
