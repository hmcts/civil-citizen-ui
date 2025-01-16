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
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';

jest.mock('../../../../main/modules/draft-store');
jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const MOCK_REQUEST = { params: { id: '123' } } as unknown as Request;
const MOCK_RESPONSE = { redirect: jest.fn() } as unknown as Response;
const MOCK_NEXT = jest.fn() as NextFunction;
jest.mock('../../../../main/services/features/generalApplication/generalApplicationService.ts', ()=> ({
  getCancelUrl: jest.fn(),
}));

describe('Check your Answers GA Guard', () => {

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
    );
    claim.generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.SUMMARY_JUDGEMENT)];
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
    expect(MOCK_RESPONSE.redirect).toHaveBeenCalled();
  });
  it('should not call cancelUrl if any party is Bilingual and user tries to submit an application', async () => {
    //Given
    const claim = new Claim();
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    claim.generalApplications = [
      {
        'id': 'test',
        'value': {
          'caseLink': {
            'CaseReference': '6789',
          },
          'generalAppSubmittedDateGAspec': new Date('2024-05-29T14:39:28.483971'),
        },
      },
    ];
    mockGetCaseData.mockImplementation(async () => claim);
    //When
    await checkYourAnswersGAGuard(MOCK_REQUEST, MOCK_RESPONSE, MOCK_NEXT);
    //Then
    expect(MOCK_NEXT).toHaveBeenCalled();

  });

});
