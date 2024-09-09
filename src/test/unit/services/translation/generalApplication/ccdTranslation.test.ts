import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {toCcdGeneralApplicationWithResponse, translateDraftApplicationToCCD} from 'services/translation/generalApplication/ccdTranslation';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {InformOtherParties} from 'models/generalApplication/informOtherParties';
import {HearingArrangement, HearingTypeOptions} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {
  UnavailableDatePeriodGaHearing,
  UnavailableDatesGaHearing,
  UnavailableDateType,
} from 'models/generalApplication/unavailableDatesGaHearing';
import {HearingSupport, SupportType} from 'models/generalApplication/hearingSupport';
import { CcdGADebtorPaymentPlanGAspec, CcdGARespondentDebtorOfferGAspec, CcdHearingType } from 'common/models/ccdGeneralApplication/ccdGeneralApplicationHearingDetails';
import { CcdSupportRequirement } from 'common/models/ccdGeneralApplication/ccdSupportRequirement';
import { GaResponse } from 'common/models/generalApplication/response/gaResponse';
import { RespondentAgreement } from 'common/models/generalApplication/response/respondentAgreement';
import { CCDRespondToApplication } from 'common/models/gaEvents/eventDto';
import { ProposedPaymentPlanOption } from 'common/models/generalApplication/response/acceptDefendantOffer';

describe('translate draft application to ccd', () => {
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
    application.hearingSupport = new HearingSupport([
      SupportType.LANGUAGE_INTERPRETER,
      SupportType.SIGN_LANGUAGE_INTERPRETER,
      SupportType.OTHER_SUPPORT,
    ], 'test1', 'test2', 'test3');
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
          'test location'),
        new HearingContactDetails('123', 'email'),
        YesNo.NO,
        new HearingSupport([
          SupportType.LANGUAGE_INTERPRETER,
          SupportType.SIGN_LANGUAGE_INTERPRETER,
          SupportType.OTHER_SUPPORT,
        ], 'test1', 'test2', 'test3'),
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

      //Then
      expect(toCcdGeneralApplicationWithResponse(gaResponse))
        .toStrictEqual({
          gaRespondentDebtorOffer: {
            debtorObjections: undefined,
            monthlyInstalment: undefined,
            paymentPlan: undefined,
            paymentSetDate: undefined,
            respondentDebtorOffer: undefined,
          },
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
            SupportRequirement: [CcdSupportRequirement.LANGUAGE_INTERPRETER, CcdSupportRequirement.SIGN_INTERPRETER, CcdSupportRequirement.OTHER_SUPPORT],
            SupportRequirementLanguageInterpreter: 'test2',
            SupportRequirementOther: 'test3',
            SupportRequirementSignLanguage: 'test1',
            generalAppUnavailableDates: [{
              value: {
                unavailableTrialDateFrom: '2024-05-01',
                unavailableTrialDateTo: undefined,
              },
            }, {
              value: {
                unavailableTrialDateFrom: '2024-05-01',
                unavailableTrialDateTo: '2024-05-02',
              },
            }],
            unavailableTrialRequiredYesOrNo: YesNoUpperCamelCase.YES,
          },
          gaRespondentConsent: YesNoUpperCamelCase.NO,
          generalAppRespondReason: 'reason for disagreement',
          generalAppRespondent1Representative: {
            hasAgreed: YesNoUpperCamelCase.NO,
          },
        } satisfies CCDRespondToApplication);
    });

    it('should convert monthly instalments to pence', () => {
      const gaResponse = {
        acceptDefendantOffer: {
          type: ProposedPaymentPlanOption.ACCEPT_INSTALMENTS,
          amountPerMonth: '123.45',
          year: 2024, month: 2, day: 28,
        },
      };

      expect(toCcdGeneralApplicationWithResponse(gaResponse))
        .toMatchObject({
          gaRespondentDebtorOffer: {
            debtorObjections: undefined,
            monthlyInstalment: '12345',
            paymentPlan: CcdGADebtorPaymentPlanGAspec.INSTALMENT,
            respondentDebtorOffer: undefined,
          } as CcdGARespondentDebtorOfferGAspec,
        });
    });
  });
});
