import { YesNo, YesNoUpperCamelCase } from 'common/form/models/yesNo';
import {
  toCcdGeneralApplicationWithResponse,
  translateDraftApplicationToCCD,
  translateCoScApplicationToCCD, fromCcdHearingType,
} from 'services/translation/generalApplication/ccdTranslation';
import { GeneralApplication } from 'models/generalApplication/GeneralApplication';
import {
  ApplicationType,
  ApplicationTypeOption,
} from 'models/generalApplication/applicationType';
import { InformOtherParties } from 'models/generalApplication/informOtherParties';
import {
  HearingArrangement,
  HearingTypeOptions,
} from 'models/generalApplication/hearingArrangement';
import { HearingContactDetails } from 'models/generalApplication/hearingContactDetails';
import {
  UnavailableDatePeriodGaHearing,
  UnavailableDatesGaHearing,
  UnavailableDateType,
} from 'models/generalApplication/unavailableDatesGaHearing';
import {
  HearingSupport,
  SupportType,
} from 'models/generalApplication/hearingSupport';
import {
  CcdGADebtorPaymentPlanGAspec,
  CcdGARespondentDebtorOfferGAspec,
  CcdHearingType,
} from 'common/models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import { CcdSupportRequirement } from 'common/models/ccdGeneralApplication/ccdSupportRequirement';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';
import { RespondentAgreement } from 'common/models/generalApplication/response/respondentAgreement';
import { CCDRespondToApplication } from 'common/models/gaEvents/eventDto';
import { ProposedPaymentPlanOption } from 'common/models/generalApplication/response/acceptDefendantOffer';
import {DefendantFinalPaymentDate} from 'form/models/certOfSorC/defendantFinalPaymentDate';
import {DebtPaymentEvidence} from 'models/generalApplication/debtPaymentEvidence';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';
import {
  CertificateOfSatisfactionOrCancellation,
} from 'models/generalApplication/CertificateOfSatisfactionOrCancellation';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {StatementOfTruthForm} from 'models/generalApplication/statementOfTruthForm';
import {OrderJudge} from 'models/generalApplication/orderJudge';
import {RequestingReason} from 'models/generalApplication/requestingReason';
import {QualifiedStatementOfTruth} from 'models/generalApplication/QualifiedStatementOfTruth';

describe('translate draft application to ccd', () => {
  it('should translate Hearing Type Options', () => {
    expect(fromCcdHearingType(CcdHearingType.TELEPHONE)).toEqual(HearingTypeOptions.TELEPHONE);
    expect(fromCcdHearingType(CcdHearingType.WITHOUT_HEARING)).toEqual(HearingTypeOptions.WITHOUT_HEARING);
    expect(fromCcdHearingType(CcdHearingType.IN_PERSON)).toEqual(HearingTypeOptions.PERSON_AT_COURT);
    expect(fromCcdHearingType(CcdHearingType.VIDEO)).toEqual(HearingTypeOptions.VIDEO_CONFERENCE);
  });

  it('should translate application types to ccd', () => {
    //Given
    const application = new GeneralApplication();
    application.applicationTypes = [
      new ApplicationType(ApplicationTypeOption.STRIKE_OUT),
    ];
    //When
    const ccdGeneralApplication = translateDraftApplicationToCCD(application);
    //Then
    expect(ccdGeneralApplication.generalAppType).toEqual({
      types: [ApplicationTypeOption.STRIKE_OUT],
    });
  });

  it('should translate inform other party to ccd', () => {
    //Given
    const application = new GeneralApplication();
    application.informOtherParties = new InformOtherParties(YesNo.NO, 'test');
    //When
    const ccdGeneralApplication = translateDraftApplicationToCCD(application);
    //Then
    expect(ccdGeneralApplication.generalAppInformOtherParty).toEqual({
      isWithNotice: YesNoUpperCamelCase.NO,
      reasonsForWithoutNotice: 'test',
    });
  });

  it('should translate inform other party to ccd for set aside judgment', () => {
    //Given
    const application = new GeneralApplication();
    application.agreementFromOtherParty = YesNo.NO;
    application.applicationTypes = [new ApplicationType(ApplicationTypeOption.SET_ASIDE_JUDGEMENT)];
    //When
    const ccdGeneralApplication = translateDraftApplicationToCCD(application);
    //Then
    expect(ccdGeneralApplication.generalAppInformOtherParty).toEqual({
      isWithNotice: YesNoUpperCamelCase.YES,
    });
  });

  it('should translate hearing details to ccd', () => {
    //Given
    const application = new GeneralApplication();
    application.hearingArrangement = new HearingArrangement(
      HearingTypeOptions.VIDEO_CONFERENCE,
      'test',
      'test location',
    );
    application.hearingContactDetails = new HearingContactDetails(
      '123',
      'email',
    );
    application.unavailableDatesHearing = new UnavailableDatesGaHearing([
      new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE, {
        year: '2024',
        month: '5',
        day: '1',
      }),
      new UnavailableDatePeriodGaHearing(
        UnavailableDateType.LONGER_PERIOD,
        { year: '2024', month: '5', day: '1' },
        { year: '2024', month: '5', day: '2' },
      ),
    ]);
    application.hearingSupport = new HearingSupport(
      [
        SupportType.LANGUAGE_INTERPRETER,
        SupportType.SIGN_LANGUAGE_INTERPRETER,
        SupportType.OTHER_SUPPORT,
      ],
      'test1',
      'test2',
      'test3',
    );
    //When
    const ccdGeneralApplication = translateDraftApplicationToCCD(application);
    //Then
    expect(ccdGeneralApplication.generalAppHearingDetails).toEqual({
      HearingDetailsEmailID: 'email',
      HearingDetailsTelephoneNumber: '123',
      HearingPreferencesPreferredType: 'VIDEO',
      HearingPreferredLocation: {
        value: {
          label: 'test location',
        },
      },
      ReasonForPreferredHearingType: 'test',
      SupportRequirement: [
        'LANGUAGE_INTERPRETER',
        'SIGN_INTERPRETER',
        'OTHER_SUPPORT',
      ],
      SupportRequirementLanguageInterpreter: 'test2',
      SupportRequirementOther: 'test3',
      SupportRequirementSignLanguage: 'test1',
      generalAppUnavailableDates: [
        {
          value: {
            unavailableTrialDateFrom: '2024-05-01',
            unavailableTrialDateTo: undefined,
          },
        },
        {
          value: {
            unavailableTrialDateFrom: '2024-05-01',
            unavailableTrialDateTo: '2024-05-02',
          },
        },
      ],
      unavailableTrialRequiredYesOrNo: 'Yes',
    });
  });

  it('should translate evidence documents to ccd', () => {
    //Given
    const application = new GeneralApplication();
    application.wantToUploadDocuments = YesNo.YES;
    application.uploadEvidenceForApplication = [
      {
        caseDocument: {
          createdBy: undefined,
          documentLink: {
            document_url: 'url',
            document_filename: 'test',
            document_binary_url: 'binary',
            category_id: 'category',
          },
          documentName: undefined,
          documentType: undefined,
          documentSize: 0,
          createdDatetime: new Date(),
        },
        fileUpload: undefined,
      },
    ];
    //When
    const ccdGeneralApplication = translateDraftApplicationToCCD(application);
    //Then
    expect(ccdGeneralApplication.generalAppEvidenceDocument).toEqual([
      {
        value: {
          category_id: 'category',
          document_binary_url: 'binary',
          document_filename: 'test',
          document_url: 'url',
        },
      },
    ]);
  });

  describe('toCcdGeneralApplicationRespondentResponse', () => {
    it('should transform respondent response', () => {
      //When
      const gaResponse = new GaResponse(
        new HearingArrangement(
          HearingTypeOptions.VIDEO_CONFERENCE,
          'test',
          'test location',
        ),
        new HearingContactDetails('123', 'email'),
        YesNo.NO,
        new HearingSupport(
          [
            SupportType.LANGUAGE_INTERPRETER,
            SupportType.SIGN_LANGUAGE_INTERPRETER,
            SupportType.OTHER_SUPPORT,
          ],
          'test1',
          'test2',
          'test3',
        ),
        new UnavailableDatesGaHearing([
          new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE, {
            year: '2024',
            month: '5',
            day: '1',
          }),
          new UnavailableDatePeriodGaHearing(
            UnavailableDateType.LONGER_PERIOD,
            { year: '2024', month: '5', day: '1' },
            { year: '2024', month: '5', day: '2' },
          ),
        ]),
        new RespondentAgreement(YesNo.NO, 'reason for disagreement'),
      );
      gaResponse.statementOfTruth = new QualifiedStatementOfTruth(true, 'test', 'director');

      //Then
      expect(toCcdGeneralApplicationWithResponse(gaResponse)).toStrictEqual({
        gaRespondentDebtorOffer: {
          debtorObjections: undefined,
          monthlyInstalment: undefined,
          paymentPlan: undefined,
          paymentSetDate: undefined,
          respondentDebtorOffer: undefined,
        },
        generalAppRespondDocument: undefined,
        hearingDetailsResp: {
          HearingDetailsEmailID: 'email',
          HearingDetailsTelephoneNumber: '123',
          HearingPreferencesPreferredType: CcdHearingType.VIDEO,
          HearingPreferredLocation: {
            value: {
              label: 'test location',
            },
          },
          ReasonForPreferredHearingType: 'test',
          SupportRequirement: [
            CcdSupportRequirement.LANGUAGE_INTERPRETER,
            CcdSupportRequirement.SIGN_INTERPRETER,
            CcdSupportRequirement.OTHER_SUPPORT,
          ],
          SupportRequirementLanguageInterpreter: 'test2',
          SupportRequirementOther: 'test3',
          SupportRequirementSignLanguage: 'test1',
          generalAppUnavailableDates: [
            {
              value: {
                unavailableTrialDateFrom: '2024-05-01',
                unavailableTrialDateTo: undefined,
              },
            },
            {
              value: {
                unavailableTrialDateFrom: '2024-05-01',
                unavailableTrialDateTo: '2024-05-02',
              },
            },
          ],
          unavailableTrialRequiredYesOrNo: YesNoUpperCamelCase.YES,
        },
        gaRespondentConsent: YesNoUpperCamelCase.NO,
        generalAppRespondReason: 'reason for disagreement',
        generalAppRespondent1Representative: {
          hasAgreed: YesNoUpperCamelCase.NO,
        },
        generalAppResponseStatementOfTruth: {
          name: 'test',
          role: 'director',
        },
      } satisfies CCDRespondToApplication);
    });

    it('should convert monthly instalments to pence', () => {
      const gaResponse = {
        acceptDefendantOffer: {
          type: ProposedPaymentPlanOption.ACCEPT_INSTALMENTS,
          amountPerMonth: '123.45',
          year: 2024,
          month: 2,
          day: 28,
        },
        statementOfTruth: {name: 'test', title: 'director'},
      };

      expect(toCcdGeneralApplicationWithResponse(gaResponse)).toMatchObject({
        gaRespondentDebtorOffer: {
          debtorObjections: undefined,
          monthlyInstalment: '12345',
          paymentPlan: CcdGADebtorPaymentPlanGAspec.INSTALMENT,
          respondentDebtorOffer: undefined,
        } as CcdGARespondentDebtorOfferGAspec,
        generalAppResponseStatementOfTruth: {name: 'test', role: 'director'},
      });
    });
  });

  describe('translateCoScApplicationToCCD', () => {
    it('should translate cosc application type to ccd', () => {
      //Given
      const application = new GeneralApplication();
      application.applicationTypes = [
        new ApplicationType(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID),
      ];
      application.agreementFromOtherParty = YesNo.NO;
      application.statementOfTruth = new StatementOfTruthForm(true, 'Defendant');
      application.informOtherParties = new InformOtherParties('No','');

      //When
      const ccdGeneralApplication = translateCoScApplicationToCCD(application);
      //Then
      expect(ccdGeneralApplication.generalAppType).toEqual({
        types: [ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID],
      });
      expect(ccdGeneralApplication.generalAppStatementOfTruth).not.toBeNull();
      expect(ccdGeneralApplication.generalAppInformOtherParty).not.toBeNull();
    });

    it('should translate certificateOfSatisfactionOrCancellation to CCD', () => {
      //Given
      const application = new GeneralApplication();
      application.applicationTypes = [
        new ApplicationType(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID),
      ];
      application.certificateOfSatisfactionOrCancellation = new CertificateOfSatisfactionOrCancellation();
      application.certificateOfSatisfactionOrCancellation.defendantFinalPaymentDate = new DefendantFinalPaymentDate('2024', '06', '12');
      application.certificateOfSatisfactionOrCancellation.debtPaymentEvidence = new DebtPaymentEvidence(debtPaymentOptions.UPLOAD_EVIDENCE_DEBT_PAID_IN_FULL);
      application.uploadEvidenceForApplication = [new UploadGAFiles()];
      application.uploadEvidenceForApplication[0].caseDocument = {
        createdBy: '',
        createdDatetime: undefined,
        documentLink: undefined,
        documentName: 'test.pdf',
        documentSize: 0,
        documentType: undefined,
      };
      //When
      const ccdGeneralApplication = translateCoScApplicationToCCD(application);
      //Then
      expect(ccdGeneralApplication.certOfSC).not.toBeNull();
      expect(ccdGeneralApplication.generalAppEvidenceDocument).not.toBeNull();
    });
  });

  it('should translate judge orders to ccd', () => {
    //Given
    const application = new GeneralApplication();
    application.orderJudges = [new OrderJudge('test order')];
    //When
    const ccdGeneralApplication = translateDraftApplicationToCCD(application);
    //Then
    expect(ccdGeneralApplication.generalAppDetailsOfOrder).toEqual('test order');
    expect(ccdGeneralApplication.generalAppDetailsOfOrderColl).toEqual([{value: 'test order'}]);
  });

  it('should translate requesting reasons to ccd', () => {
    //Given
    const application = new GeneralApplication();
    application.requestingReasons = [new RequestingReason('test reason')];
    //When
    const ccdGeneralApplication = translateDraftApplicationToCCD(application);
    //Then
    expect(ccdGeneralApplication.generalAppReasonsOfOrder).toEqual('test reason');
    expect(ccdGeneralApplication.generalAppReasonsOfOrderColl).toEqual([{value: 'test reason'}]);
  });
});
