import { Claim } from 'models/claim';
import { getSummarySections, getCoScSummarySections } from 'services/features/generalApplication/checkAnswers/checkAnswersService';
import { GeneralApplication } from 'models/generalApplication/GeneralApplication';
import {
  ApplicationType,
  ApplicationTypeOption,
} from 'models/generalApplication/applicationType';
import {
  HearingArrangement,
  HearingTypeOptions,
} from 'models/generalApplication/hearingArrangement';
import {
  HearingSupport,
  SupportType,
} from 'models/generalApplication/hearingSupport';
import { YesNo } from 'form/models/yesNo';
import {
  UnavailableDatePeriodGaHearing,
  UnavailableDatesGaHearing,
  UnavailableDateType,
} from 'models/generalApplication/unavailableDatesGaHearing';
import { InformOtherParties } from 'models/generalApplication/informOtherParties';
import { OrderJudge } from 'models/generalApplication/orderJudge';
import { RequestingReason } from 'models/generalApplication/requestingReason';
import { HearingContactDetails } from 'models/generalApplication/hearingContactDetails';
import { UploadGAFiles } from 'models/generalApplication/uploadGAFiles';
import {
  CertificateOfSatisfactionOrCancellation,
} from 'models/generalApplication/CertificateOfSatisfactionOrCancellation';
import {DefendantFinalPaymentDate} from 'form/models/certOfSorC/defendantFinalPaymentDate';
import {DebtPaymentEvidence} from 'models/generalApplication/debtPaymentEvidence';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Check Answers service', () => {
  describe('Build check answers for submit general application', () => {
    let claim: Claim;
    let generalApplication: GeneralApplication;
    beforeEach(() => {
      claim = new Claim();
      generalApplication = new GeneralApplication();
      claim.generalApplication = generalApplication;
      generalApplication.applicationTypes = [
        new ApplicationType(ApplicationTypeOption.EXTEND_TIME),
        new ApplicationType(ApplicationTypeOption.STRIKE_OUT),
        new ApplicationType(ApplicationTypeOption.SET_ASIDE_JUDGEMENT),
      ];
      generalApplication.hearingArrangement = new HearingArrangement();
      generalApplication.hearingArrangement.option = HearingTypeOptions.TELEPHONE;
      generalApplication.hearingArrangement.reasonForPreferredHearingType = 'test';
      generalApplication.hearingArrangement.courtLocation = 'Court 1';
      generalApplication.hearingSupport = new HearingSupport([
        SupportType.HEARING_LOOP, SupportType.STEP_FREE_ACCESS, SupportType.LANGUAGE_INTERPRETER, SupportType.SIGN_LANGUAGE_INTERPRETER, SupportType.OTHER_SUPPORT,
      ]);
      generalApplication.agreementFromOtherParty = YesNo.YES;
      generalApplication.informOtherParties = new InformOtherParties();
      generalApplication.informOtherParties.option = YesNo.YES;
      generalApplication.unavailableDatesHearing = new UnavailableDatesGaHearing();
      generalApplication.unavailableDatesHearing.items = [
        new UnavailableDatePeriodGaHearing(UnavailableDateType.SINGLE_DATE, {year: '2024', month: '1', day: '1'}),
        new UnavailableDatePeriodGaHearing(UnavailableDateType.LONGER_PERIOD, {year: '2024', month: '1', day: '1'}, {year: '2024', month: '1', day: '1'}),
      ];
      generalApplication.applicationCosts = YesNo.NO;
      generalApplication.orderJudges = [
        new OrderJudge('test1'),
        new OrderJudge('test2'),
        new OrderJudge('test3'),
      ];
      generalApplication.requestingReasons = [
        new RequestingReason('test1'),
        new RequestingReason('test2'),
        new RequestingReason('test3'),
      ];
      generalApplication.wantToUploadDocuments = YesNo.YES;
      generalApplication.uploadEvidenceForApplication = [new UploadGAFiles()];
      generalApplication.uploadEvidenceForApplication[0].caseDocument = {
        createdBy: '',
        createdDatetime: undefined,
        documentLink: undefined,
        documentName: 'test.pdf',
        documentSize: 0,
        documentType: undefined,
      };
      generalApplication.hearingContactDetails = new HearingContactDetails();
      generalApplication.hearingContactDetails.emailAddress = 'a@b.com';
      generalApplication.hearingContactDetails.telephoneNumber = '12345';
    });

    it('should give correct row count for multiple application types', () => {
      const result = getSummarySections('12345', claim, 'en');
      expect(result).toHaveLength(20);
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION_TYPE');
      expect(result[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION_TYPE');
    });

    it('should give correct row count for single application type', () => {
      generalApplication.applicationTypes = [new ApplicationType(ApplicationTypeOption.EXTEND_TIME)];
      generalApplication.orderJudges = [new OrderJudge('test1')];
      generalApplication.requestingReasons = [new RequestingReason('test1')];
      const result = getSummarySections('12345', claim, 'en');
      expect(result).toHaveLength(14);
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.APPLICATION_TYPE');
      expect(result[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.PARTIES_AGREED');
    });
  });

  describe('Build check answers for submit cosc general application type', () => {
    let claim: Claim;
    let generalApplication: GeneralApplication;
    beforeEach(() => {
      claim = new Claim();
      generalApplication = new GeneralApplication();
      claim.generalApplication = generalApplication;
      generalApplication.applicationTypes = [
        new ApplicationType(ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID),
      ];
      generalApplication.certificateOfSatisfactionOrCancellation = new CertificateOfSatisfactionOrCancellation();
      generalApplication.certificateOfSatisfactionOrCancellation.defendantFinalPaymentDate = new DefendantFinalPaymentDate('2024', '07', '12');
      generalApplication.certificateOfSatisfactionOrCancellation.debtPaymentEvidence = new DebtPaymentEvidence(debtPaymentOptions.UPLOAD_EVIDENCE);
      generalApplication.uploadEvidenceForApplication = [new UploadGAFiles()];
      generalApplication.uploadEvidenceForApplication[0].caseDocument = {
        createdBy: '',
        createdDatetime: undefined,
        documentLink: undefined,
        documentName: 'test.pdf',
        documentSize: 0,
        documentType: undefined,
      };
    });

    it('should give correct row count for multiple application types', () => {
      const result = getCoScSummarySections('12345', claim, 'en');
      expect(result).toHaveLength(3);
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.FINAL_DEFENDANT_PAYMENT_DATE.FORM_HEADER_1');
      expect(result[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.DEBT_PAYMENT.DO_YOU_WANT_PROVIDE_EVIDENCE');
      expect(result[2].key.text).toEqual('PAGES.GENERAL_APPLICATION.CHECK_YOUR_ANSWER.COSC.UPLOAD_DOCUMENTS');
    });

    it('should give correct row count for multiple application types', () => {
      claim.generalApplication.uploadEvidenceForApplication = null;
      claim.generalApplication.certificateOfSatisfactionOrCancellation.debtPaymentEvidence = new DebtPaymentEvidence(debtPaymentOptions.NO_EVIDENCE, 'testing');
      const result = getCoScSummarySections('12345', claim, 'en');
      expect(result).toHaveLength(2);
      expect(result[0].key.text).toEqual('PAGES.GENERAL_APPLICATION.FINAL_DEFENDANT_PAYMENT_DATE.FORM_HEADER_1');
      expect(result[1].key.text).toEqual('PAGES.GENERAL_APPLICATION.DEBT_PAYMENT.DO_YOU_WANT_PROVIDE_EVIDENCE');
    });
  });
});

