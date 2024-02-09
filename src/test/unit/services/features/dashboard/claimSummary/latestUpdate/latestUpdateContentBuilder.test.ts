import {DateTime, Settings} from 'luxon';
import {Claim} from 'models/claim';
import {
  buildResponseToClaimSection, buildResponseToClaimSectionForClaimant,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContentBuilder';
import {CaseState} from 'form/models/claimDetails';
import {PartyType} from 'models/partyType';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {BILINGUAL_LANGUAGE_PREFERENCE_URL} from 'routes/urls';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {ResponseType} from 'form/models/responseType';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {FullAdmission} from 'models/fullAdmission';
import {addDaysToDate, formatDateToFullDate} from 'common/utils/dateUtils';
import {
  getAmount,
  getFirstRepaymentDate,
  getPaymentAmount,
  getPaymentDate,
  getRepaymentFrequency,
} from 'common/utils/repaymentUtils';
import currencyFormat from 'common/utils/currencyFormat';
import {PartialAdmission} from 'models/partialAdmission';
import {LatestUpdateSectionBuilder} from 'common/models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {t} from 'i18next';
import {DocumentType} from 'models/document/documentType';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {HowMuchHaveYouPaid} from 'common/form/models/admission/howMuchHaveYouPaid';
import {MediationAgreement} from 'models/mediation/mediationAgreement';
import {CaseDocument} from 'common/models/document/caseDocument';
import {Document} from 'common/models/document/document';
import {
  SystemGeneratedCaseDocumentsWithSEALEDCLAIMAndSDOMock,
  SystemGeneratedCaseDocumentsWithSEALEDCLAIMMock,
} from '../../../../../../utils/mocks/SystemGeneratedCaseDocumentsMock';
import {ClaimantResponse} from 'models/claimantResponse';
import {Mediation} from 'models/mediation/mediation';
import {HowMuchDoYouOwe} from 'form/models/admission/partialAdmission/howMuchDoYouOwe';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const PAGES_LATEST_UPDATE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT';

const PARTY_NAME = 'Mr. John Doe';

const getClaim = (partyType: PartyType, responseType: ResponseType, paymentOptionType: PaymentOptionType) => {
  const claim = new Claim();
  claim.id = '1';
  claim.totalClaimAmount = 1000;
  claim.respondent1 = {
    responseType : responseType,
    type: partyType,
  };
  claim.applicant1 = {
    type: partyType,
    responseType: responseType,
    partyDetails: {
      partyName: PARTY_NAME,
      individualTitle: 'Mr.',
      individualFirstName: 'TestName',
      individualLastName: 'TestLastName',
    },
  };
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  claim.fullAdmission.paymentIntention.paymentOption = paymentOptionType;
  claim.fullAdmission.paymentIntention.paymentDate = new Date(Date.now());
  claim.fullAdmission.paymentIntention.repaymentPlan = {
    paymentAmount: 100,
    repaymentFrequency: 'Monthly',
    firstRepaymentDate: new Date(Date.now()),
  };
  claim.partialAdmission = new PartialAdmission();
  claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe(100);
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = paymentOptionType;
  claim.partialAdmission.paymentIntention.paymentDate = new Date(Date.now());
  claim.partialAdmission.paymentIntention.repaymentPlan = {
    paymentAmount: 100,
    repaymentFrequency: 'Monthly',
    firstRepaymentDate: new Date(Date.now()),
  };
  claim.systemGeneratedCaseDocuments = SystemGeneratedCaseDocumentsWithSEALEDCLAIMMock();
  claim.claimantResponse =new ClaimantResponse();
  return claim;
};

const getClaimWithSdoDocument = () =>  {
  const claim = new Claim();
  claim.id = '001';
  claim.systemGeneratedCaseDocuments = SystemGeneratedCaseDocumentsWithSEALEDCLAIMAndSDOMock();
  claim.sdoOrderDocument = {
    id: '1',
    'value': {
      'createdBy': 'Civil',
      'documentLink': {
        'document_url': 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de',
        'document_filename': 'sealed_claim_form_000MC001.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de/binary',
      },
      'documentName': 'sealed_claim_form_000MC001.pdf',
      'documentSize': 45794,
      'documentType': DocumentType.SDO_ORDER,
      'createdDatetime': new Date('2022-06-21T14:15:19'),
    },
  };
  return claim;
};
const docId = '123';
const getLastUpdateSdoDocumentExpected = (claimId: string, lng: string) => {
  return new LatestUpdateSectionBuilder()
    .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_AN_ORDER_HAS_BEEN_ISSUED_BY_THE_COURT`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_PLEASE_FOLLOW_THE_INSTRUCTIONS_IN_THE_ORDER`, {lng}))
    .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_THIS_CLAIM_WILL_NO_PROCEED_OFFLINE`, {lng}))
    .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_DOWNLOAD_THE_COURTS_ORDER`, {lng}), claimId, docId, null, `${PAGES_LATEST_UPDATE_CONTENT}.SDO_TO_FIND_OUT_THE_DETAILS`)
    .build();
};

describe('Latest Update Content Builder', () => {
  const partyName = 'Mr. John Doe';
  const claim = new Claim();
  claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
  claim.respondent1ResponseDeadline = new Date('2022-07-29T15:59:59');
  claim.applicant1 = {
    type: PartyType.INDIVIDUAL,
    partyDetails: {
      partyName: partyName,
    },
  };
  const claimId = '1';
  const bilingualLanguagePreferencetUrl = BILINGUAL_LANGUAGE_PREFERENCE_URL.replace(':id', claimId);
  const lng = 'en';

  describe('test buildResponseToClaimSection', () => {
    it('should have responseNotSubmittedTitle and respondToClaimLink', () => {
      // Given
      const expectedNow = DateTime.local(2022, 7, 1, 23, 0, 0);
      Settings.now = () => expectedNow.toMillis();
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId, lng);
      // Then
      expect(responseToClaimSection.length).toBe(3);
      expect(responseToClaimSection[0].type).toEqual(ClaimSummaryType.TITLE);
      expect(responseToClaimSection[0].data?.text).toEqual(t('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVENT_RESPONDED_TO_CLAIM', {lng: 'en'}));
      expect(responseToClaimSection[2].type).toEqual(ClaimSummaryType.LINK);
      expect(responseToClaimSection[2].data?.href).toEqual(bilingualLanguagePreferencetUrl);
    });

    it('should have deadline extended title when defendant extended response deadline', () => {
      //Given
      claim.respondentSolicitor1AgreedDeadlineExtension = new Date();
      //When
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId, lng);
      // Then
      expect(responseToClaimSection.length).toBe(3);
      expect(responseToClaimSection[0].type).toEqual(ClaimSummaryType.TITLE);
      expect(responseToClaimSection[0].data?.text).toEqual(t('PAGES.LATEST_UPDATE_CONTENT.MORE_TIME_REQUESTED', {lng: 'en'}));
      expect(responseToClaimSection[2].type).toEqual(ClaimSummaryType.LINK);
      expect(responseToClaimSection[2].data?.href).toEqual(bilingualLanguagePreferencetUrl);
    });

    it('should have responseDeadlineNotPassedContent when defendant not responded before dead line', () => {
      // Given
      const expectedNow = DateTime.local(2022, 6, 1, 23, 0, 0);
      Settings.now = () => expectedNow.toMillis();
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId, lng);
      // Then
      expect(responseToClaimSection[1].type).toEqual(ClaimSummaryType.PARAGRAPH);
    });
    it('should have responseDeadlinePassedContent when defendant not responded after dead line', () => {
      // Given
      const expectedNow = DateTime.local(2022, 8, 1, 23, 0, 0);
      Settings.now = () => expectedNow.toMillis();
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId, lng);
      // Then
      expect(responseToClaimSection.length).toBe(5);
      expect(responseToClaimSection[0].type).toEqual(ClaimSummaryType.TITLE);
      expect(responseToClaimSection[1].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(responseToClaimSection[2].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(responseToClaimSection[3].type).toEqual(ClaimSummaryType.PARAGRAPH);
      expect(responseToClaimSection[4].type).toEqual(ClaimSummaryType.LINK);
      expect(responseToClaimSection[4].data?.href).toEqual(bilingualLanguagePreferencetUrl);
    });

    it('should be with Response information when claim state is different from AWAITING_RESPONDENT_ACKNOWLEDGEMENT', () => {
      // Given
      claim.ccdState = CaseState.PENDING_CASE_ISSUED;
      // when
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId, lng);
      // Then
      expect(responseToClaimSection.length).toBe(1);
    });
  });
  describe('Test latest Update when we response the claim', () => {
    describe('Full Admit Pay ', () => {
      it('Immediately', () => {
        // Given
        const claim = getClaim(PartyType.COMPANY, ResponseType.FULL_ADMISSION, PaymentOptionType.IMMEDIATELY);
        const respondentPaymentDeadline = new Date('2023-11-13');
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_SAID_YOU_WILL_PAY`, {lng}), {
            claimantName: claim.getClaimantFullName(),
            amount: currencyFormat(getAmount(claim)),
            paymentDate: formatDateToFullDate(respondentPaymentDeadline, lng),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.IF_YOU_PAY_BY_CHEQUE`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.IF_THEY_DONT_RECEIVE_THE_MONEY_BY_THEN`)
          .addContactLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.CONTACT`, {lng}), claim.id, {claimantName: claim.getClaimantFullName()})
          .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claim.id, docId)
          .build();

        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId, lng, respondentPaymentDeadline);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Full Admit Pay Set Date + Defendant ISNOT Company or ORG', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.FULL_ADMISSION, PaymentOptionType.BY_SET_DATE);
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_BY`, {lng}), {
            claimantName: claim.getClaimantFullName(),
            paymentDate: formatDateToFullDate(getPaymentDate(claim), lng),
          })
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
          .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claim.id, docId)
          .build();

        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId, lng);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Full Admit Pay Set Date + Defendant IS Company or ORG', () => {
        // Given
        const claim = getClaim(PartyType.COMPANY, ResponseType.FULL_ADMISSION, PaymentOptionType.BY_SET_DATE);
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_BY`, {lng}), {
            claimantName: claim.getClaimantFullName(),
            paymentDate: formatDateToFullDate(getPaymentDate(claim), lng),
          })
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`, {lng}))
          .addContactLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, {lng}), claim.id, {claimantName: claim.getClaimantFullName()})
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
          .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claim.id, docId)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId, lng);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Full Admit Pay Instalments + Defendant ISNOT Company or ORG ', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.FULL_ADMISSION, PaymentOptionType.INSTALMENTS);
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_STARTING`, {lng}), {
            claimantName: claim.getClaimantFullName(),
            installmentAmount:  currencyFormat(getPaymentAmount(claim)),
            paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
            paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
          })
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
          .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claim.id, docId)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId, lng);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Full Admit Pay Instalments+ Defendant IS Company or ORG', () => {
        // Given
        const claim = getClaim(PartyType.COMPANY, ResponseType.FULL_ADMISSION, PaymentOptionType.INSTALMENTS);
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_STARTING`, {lng}), {
            claimantName: claim.getClaimantFullName(),
            installmentAmount:  currencyFormat(getPaymentAmount(claim)),
            paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
            paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
          })
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`, {lng}))
          .addContactLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, {lng}), claim.id, {claimantName: claim.getClaimantFullName()})
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
          .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claim.id, docId)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId, lng);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
    });
    describe('Part Admit Pay', () => {
      it('Immediately', () => {
        // Given
        const claim = getClaim(PartyType.COMPANY, ResponseType.PART_ADMISSION, PaymentOptionType.IMMEDIATELY);
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_IMMEDIATELY`, {lng}), {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
          })
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
          .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claim.id, docId)
          .build();

        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId, lng);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay SET DATE - Defendant IS Org or Company', () => {
        // Given
        const claim = getClaim(PartyType.COMPANY, ResponseType.PART_ADMISSION, PaymentOptionType.BY_SET_DATE);
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {lng}), {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
            paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
          })
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`, {lng}))
          .addContactLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, {lng}), claim.id, {claimantName: claim.getClaimantFullName()})
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
          .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claim.id, docId)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId, lng);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay SET DATE - Defendant IS NOT Org or Company', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.BY_SET_DATE);
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {lng}), {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
            paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
          })
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
          .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claim.id, docId)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay Installments - Defendant IS Org or Company', () => {
        // Given
        const claim = getClaim(PartyType.COMPANY, ResponseType.PART_ADMISSION, PaymentOptionType.INSTALMENTS);
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARTING`, {lng}), {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
            installmentAmount: currencyFormat(getPaymentAmount(claim)),
            paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
            paymentDate: formatDateToFullDate(getPaymentDate(claim),lng),
          })
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`, {lng}))
          .addContactLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, {lng}), claim.id, {claimantName: claim.getClaimantFullName()})
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
          .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claim.id, docId)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });

      it('Part Admit Pay Installments - Defendant IS NOT Org or Company', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.INSTALMENTS);
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`, {lng}))
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARTING`, {lng}), {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
            installmentAmount: currencyFormat(getPaymentAmount(claim)),
            paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
            paymentDate: formatDateToFullDate(getPaymentDate(claim),lng),
          })
          .addParagraph(t(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`, {lng}))
          .addResponseDocumentLink(t(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, {lng}), claim.id, docId)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });

      it('Part Admit Pay Already Paid - Claimant accepted already paid and settled', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.IMMEDIATELY);
        claim.partialAdmission = {
          alreadyPaid: {
            option: 'yes',
          },
        } as any;
        claim.applicant1PartAdmitConfirmAmountPaidSpec = 'Yes';
        claim.applicant1PartAdmitIntentionToSettleClaimSpec = 'Yes';
        claim.partAdmitPaidValuePounds = 500;
        claim.respondent1PaymentDateToStringSpec = new Date(0);
        const claimantFullName = claim.getClaimantFullName();
        const amount = claim?.partAdmitPaidValuePounds;
        const moneyReceivedOn = formatDateToFullDate(claim.respondent1PaymentDateToStringSpec, lng);
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIM_SETTLED`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIMANT_CONFIRMED_YOU_PAID`, { claimantName: claimantFullName, amount, moneyReceivedOn })
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, docId)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay Already Paid - Claimant accepted already paid and not settled', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.IMMEDIATELY);
        claim.partialAdmission = {
          alreadyPaid: {
            option: 'yes',
          },
        } as any;
        claim.applicant1PartAdmitConfirmAmountPaidSpec = 'Yes';
        claim.applicant1PartAdmitIntentionToSettleClaimSpec = 'No';
        claim.partAdmitPaidValuePounds = 500;
        const partAmount = claim.partAdmitPaidValuePounds;
        const fullAmount = claim.totalClaimAmount;
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.WAIT_FOR_THE_COURT_TO_REVIEW_THE_CASE`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.THEY_ACCEPT_THAT_YOU_HAVE_PAID_THEM`, { partAmount, fullAmount })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_MIGHT_HAVE_TO_GO_TO_A_COURT_HEARING`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, docId)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay Already Paid - Claimant rejected already paid', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.IMMEDIATELY);
        claim.partialAdmission = {
          alreadyPaid: {
            option: 'yes',
          },
        } as any;
        claim.applicant1PartAdmitConfirmAmountPaidSpec = 'No';
        claim.partAdmitPaidValuePounds = 500;
        const claimId = claim.id;
        const partAmount = claim.partAdmitPaidValuePounds;
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.WAIT_FOR_THE_COURT_TO_REVIEW_THE_CASE`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.THEY_SAID_YOU_DIDN'T_PAY_THEM`, { partAmount })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_MIGHT_HAVE_TO_GO_TO_A_COURT_HEARING`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, docId)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay Immediately - Claimant accepted the amount', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.IMMEDIATELY);
        claim.applicant1AcceptAdmitAmountPaidSpec = 'Yes';
        const claimantFullName = claim.getClaimantFullName();
        const immediatePaymentDate = addDaysToDate(claim?.respondent1ResponseDate, 5);
        const immediatePaymentDeadline = formatDateToFullDate(immediatePaymentDate, lng);
        const claimId = claim.id;
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIMANT_ACCEPTED_PART_ADMIT_PAYMENT`, {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claimantFullName,
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_MUST_PAY_THEM_BY_PAYMENT_DATE`, { paymentDate: immediatePaymentDeadline })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.IF_MONEY_NOT_RECEIVED_COUNTY_COURT_JUDGEMENT_AGAINST_YOU`)
          .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.CONTACT`, claimId, { claimantName: claimantFullName }, `${PAGES_LATEST_UPDATE_CONTENT}.IF_YOU_NEED_THEIR_PAYMENT_DETAILS_GET_RECEIPTS_FOR_ANY_PAYMENTS`)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay Immediately - Claimant passed deadline to respond', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.IMMEDIATELY);
        claim.applicant1AcceptAdmitAmountPaidSpec = 'Yes';
        claim.applicant1ResponseDeadline = new Date('2023-07-01T16:00:00');
        const claimantName = claim.getClaimantFullName();
        const deadline = formatDateToFullDate(claim.applicant1ResponseDeadline);
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.THE_COURT_ENDED_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.DID_N'T_PROCEED_WITH_IT_BEFORE_THE_DEADLINE`, { claimantName, deadline })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.IF_THEY_WANT_TO_RESTART_THE_CLAIM_THEY_NEED_TO_ASK_FOR_PERMISSION_FROM_THE_COURT`)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay Immediately - Claim in mediation', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.IMMEDIATELY);
        claim.ccdState = CaseState.IN_MEDIATION;
        const claimantName = claim.getClaimantFullName();
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.REJECTED_YOUR_RESPONSE`, { claimantName })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_BOTH_AGREED_TO_TRY_MEDIATION`)
          .addLink(`${PAGES_LATEST_UPDATE_CONTENT}.MORE_INFO_ABOUT_MEDIATION_WORKS`, 'https://www.gov.uk/guidance/small-claims-mediation-service', '', '', '', true)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });

      it('Part Admit Pay Immediately - Claimant opted out of mediation', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.IMMEDIATELY);
        claim.applicant1ClaimMediationSpecRequiredLip = {
          hasAgreedFreeMediation: 'No',
        };
        claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.YES);

        const claimantName = claim.getClaimantFullName();
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.WAIT_FOR_THE_COURT_TO_REVIEW_THE_CASE`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.REJECTED_YOUR_RESPONSE`, { claimantName })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.NO_TO_TRYING_MEDIATION`, { claimantName })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.THE_COURT_WILL_REVIEW_THE_CASE`)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
    });
  });
  describe('test SDO Document buildResponseToClaimSection', () => {
    it('should have build SDO document section', () => {
      // Given
      const claim = getClaimWithSdoDocument();
      const lastUpdateSdoDocumentExpected = getLastUpdateSdoDocumentExpected(claim.id, lng);

      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);

      // Then
      expect(responseToClaimSection.length).toBe(4);
      expect(lastUpdateSdoDocumentExpected.flat()).toEqual(responseToClaimSection);
    });
  });
  describe('test status paid buildResponseToClaimSection', () => {
    it('should have build status paid section part admit already paid', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, undefined);
      claim.partialAdmission.alreadyPaid = <GenericYesNo>{option: YesNo.YES};
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(4);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.YOUR_RESPONSE_TO_THE_CLAIM');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.WE_HAVE_EMAILED');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.WE_WILL_CONTACT_YOU');
      expect(responseToClaimSection[3].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.DOWNLOAD_YOUR_RESPONSE');
      expect(responseToClaimSection[3].data.href).toBe('/case/1/documents/123');
    });
    it('should have build claim settled section full defence paid full scenario', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.FULL_DEFENCE, undefined);
      claim.rejectAllOfClaim = {
        option: 'alreadyPaid',
        howMuchHaveYouPaid: <HowMuchHaveYouPaid>{
          amount: 1000,
          date: new Date('2023-02-02T00:00:00.000Z'),
          year: 2023,
          month: 2,
          day: 2,
          text: 'test',
        },
        whyDoYouDisagree: {
          text: 'test',
        },
        defence: {
          text: 'test',
        },
      };
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(4);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.YOUR_RESPONSE_TO_THE_CLAIM');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.WE_HAVE_EMAILED');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.WE_WILL_CONTACT_YOU');
      expect(responseToClaimSection[3].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.DOWNLOAD_YOUR_RESPONSE');
      expect(responseToClaimSection[3].data.href).toBe('/case/1/documents/123');
    });
    it('should have build claim settled section full defence paid less scenario', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.FULL_DEFENCE, undefined);
      claim.rejectAllOfClaim = {
        option : 'alreadyPaid',
        howMuchHaveYouPaid: <HowMuchHaveYouPaid>{
          amount: 500,
          date: new Date('2023-02-02T00:00:00.000Z'),
          year: 2023,
          month: 2,
          day: 2,
          text: 'test',
        },
        whyDoYouDisagree: {
          text: 'test',
        },
        defence: {
          text: 'test',
        },
      };
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(4);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.YOUR_RESPONSE_TO_THE_CLAIM');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.WE_HAVE_EMAILED');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.WE_WILL_CONTACT_YOU');
      expect(responseToClaimSection[3].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.DOWNLOAD_YOUR_RESPONSE');
      expect(responseToClaimSection[3].data.href).toBe('/case/1/documents/123');
    });
  });

  describe('test Claim ended buildResponseToClaimSection', () => {
    it('should have build claim ended section', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.FULL_DEFENCE, undefined);
      claim.ccdState = CaseState.PROCEEDS_IN_HERITAGE_SYSTEM;
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(2);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CLAIM_ENDED_TITLE');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CLAIM_ENDED_MESSAGE');
      expect(responseToClaimSection[2]).toBeUndefined();
    });
  });

  describe('test Claim mediation successfull buildResponseToClaimSection', () => {
    it('should have build mediation successfull section', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.INSTALMENTS);
      claim.ccdState = CaseState.CASE_STAYED;
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.YES);
      claim.mediationAgreement = <MediationAgreement>{
        name: 'test',
        document: <Document>{
          document_url: 'http://dm-store:8080/documents/b46f785e-5f2d-4b7a-a359-d516a97f37bc',
          document_filename: 'sealed_claim_form_000MC003.pdf',
          document_binary_url: 'http://dm-store:8080/documents/b46f785e-5f2d-4b7a-a359-d516a97f37bc/binary',
        },
        documentType: DocumentType.MEDIATION_AGREEMENT,
      };
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(4);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVE_SETTLED_CLAIM_TITLE');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVE_SETTLED_CLAIM');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.MEDIATION_AGREEMENT');
      expect(responseToClaimSection[2].data.href).toBe('/case/1/documents/b46f785e-5f2d-4b7a-a359-d516a97f37bc');
      expect(responseToClaimSection[3].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CONTACT');
      expect(responseToClaimSection[3].data.href).toBe('/dashboard/1/contact-them');
      expect(responseToClaimSection[4]).toBeUndefined();
    });
  });

  describe('test Claim mediation unsuccessfull buildResponseToClaimSection', () => {
    it('should have build mediation unsuccessfull section', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.INSTALMENTS);
      claim.unsuccessfulMediationReason ='test';
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.YES);
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(3);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.MEDIATION_UNSUCCESSFUL_TITLE');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.MEDIATION_UNSUCCESSFUL_MSG1');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.MEDIATION_UNSUCCESSFUL_MSG2');
      expect(responseToClaimSection[3]).toBeUndefined();
    });
  });

  describe('test default judgement submitted buildResponseToClaimSection', () => {
    it('should have build default judgement submitted section', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.INSTALMENTS);
      claim.defaultJudgmentDocuments = [<CaseDocument>{}];
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.YES);
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(9);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.DEFAULT_JUDGMENT_SUBMITTED_TITLE');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.DEFAULT_JUDGMENT_MSG1');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.DEFAULT_JUDGMENT_MSG2');
      expect(responseToClaimSection[3].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.DEFAULT_JUDGMENT_MSG3');
      expect(responseToClaimSection[4].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CONTACT_INFO');
      expect(responseToClaimSection[5].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.EMAIL_ID');
      expect(responseToClaimSection[5].data.href).toBe('mailto:contactocmc@justice.gov.uk');
      expect(responseToClaimSection[6].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.TELEPHONE');
      expect(responseToClaimSection[7].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.WORKING_HOURS');
      expect(responseToClaimSection[8].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.WE_WILL_POST_COPY');
      expect(responseToClaimSection[9]).toBeUndefined();
    });
  });

  describe('test CCJ requested buildResponseToClaimSection', () => {
    it('should have build CCJ requested section', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.INSTALMENTS);
      claim.ccjJudgmentStatement ='test';
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.YES);
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(7);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CCJ_REQUESTED_TITLE');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CCJ_REQUESTED_MSG1');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CCJ_REQUESTED_MSG2');
      expect(responseToClaimSection[3].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CCJ_REQUESTED_MSG3');
      expect(responseToClaimSection[4].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CERTIFICATE_LINK');
      expect(responseToClaimSection[4].data.href).toBe('https://www.gov.uk/government/publications/form-n443-application-for-a-certificate-of-satisfaction-or-cancellation');
      expect(responseToClaimSection[5].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CONTACT');
      expect(responseToClaimSection[5].data.href).toBe('/dashboard/1/contact-them');
      expect(responseToClaimSection[6].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.DOWNLOAD_YOUR_RESPONSE');
      expect(responseToClaimSection[6].data.href).toBe('/case/1/documents/123');
      expect(responseToClaimSection[7]).toBeUndefined();
    });
  });

  describe('test Claim Settled buildResponseToClaimSection', () => {
    it('should have build claim settled section part admit already paid scenario', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.INSTALMENTS);
      claim.ccdState = CaseState.CASE_SETTLED;
      claim.lastModifiedDate = new Date();
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.YES);
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(3);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.DASHBOARD.STATUS_DEFENDANT.CLAIM_SETTLED');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CLAIMANT_CONFIRMED_SETTLED_CLAIM');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.DOWNLOAD_YOUR_RESPONSE');
      expect(responseToClaimSection[2].data.href).toBe('/case/1/documents/123');
      expect(responseToClaimSection[3]).toBeUndefined();
    });
  });

  describe('test claimant rejects payment plan', () => {
    it('should have build claimant reject payment plan scenario', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.INSTALMENTS);
      claim.ccdState = CaseState.PROCEEDS_IN_HERITAGE_SYSTEM;
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = new GenericYesNo(YesNo.NO);
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(4);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.DASHBOARD.STATUS_DEFENDANT.WAITING_COURT_REVIEW');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CLAIMANT_REJECT_PAYMENT_PLAN_MSG1');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CLAIMANT_REJECT_PAYMENT_PLAN_MSG2');
      expect(responseToClaimSection[3].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CLAIMANT_REJECT_PAYMENT_PLAN_MSG3');
    });
  });

  describe('Test FD with/without mediation  and for FT claim buildResponseToClaimSection', () => {
    it('FD and dispute all and respondent rejected free mediation', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.FULL_DEFENCE, undefined);
      claim.rejectAllOfClaim = {
        'option': 'dispute',
        'defence': {'text': 'disagree statement'},
      };

      claim.mediation = new Mediation(undefined, undefined, undefined, {option: YesNo.NO});
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(5);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.YOUR_RESPONSE_TO_THE_CLAIM');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVE_REJECTED_CLAIM_MSG1');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVE_REJECTED_CLAIM_MSG2');
      expect(responseToClaimSection[3].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVE_REJECTED_CLAIM_MSG3');
      expect(responseToClaimSection[4].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.DOWNLOAD_YOUR_RESPONSE');
      expect(responseToClaimSection[4].data.href).toBe('/case/1/documents/123');
    });

    it('FD and dispute all and respondent agreed for free mediation.', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.FULL_DEFENCE, undefined);
      claim.rejectAllOfClaim = {
        'option': 'dispute',
        'defence': {'text': 'disagree statement'},
      };

      claim.mediation = new Mediation(undefined, { option: YesNo.NO }, undefined, undefined);
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(4);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.DASHBOARD.STATUS_DEFENDANT.AWAITING_CLAIMANT_RESPONSE');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVE_REJECTED_CLAIM');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.NO_MEDIATION_REQUIRED');
      expect(responseToClaimSection[3].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.WILL_CONTACT_WHEN_CLAIMANT_RESPONDS');
    });

    it('Its a Fast Track Claim and Defendant responded with FD + dispute the claim', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.FULL_DEFENCE, undefined);
      claim.totalClaimAmount = 15000;
      claim.rejectAllOfClaim = {
        'option': 'dispute',
        'defence': {'text': 'disagree statement'},
      };

      claim.mediation = new Mediation(undefined, undefined, undefined, {option: YesNo.NO});
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(3);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.YOUR_RESPONSE_TO_THE_CLAIM');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVE_REJECTED_CLAIM_MSG4');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.WILL_CONTACT_WHEN_CLAIMANT_RESPONDS');
    });
  });

  describe('Part admit not paid - Fast track or No Mediation', () => {
    it('should have build judicial referral section part admit not paid scenario', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, undefined);
      claim.partialAdmission.alreadyPaid = new GenericYesNo(YesNo.NO);
      claim.applicant1AcceptAdmitAmountPaidSpec = YesNoUpperCamelCase.NO;
      const fullAmount = claim.totalClaimAmount;
      const partAmount = claim.partialAdmission?.howMuchDoYouOwe?.amount;
      const claimantName = claim.getClaimantFullName();
      const lastUpdateExpected = new LatestUpdateSectionBuilder()
        .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.REJECTED_YOUR_ADMISSION`, { claimantName, partAmount })
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.THEY_BELIEVE_FULL_AMOUNT_CLAIMED`, { fullAmount })
        .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_MIGHT_HAVE_TO_GO_TO_A_COURT_HEARING`)
        .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, docId)
        .build();

      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(lastUpdateExpected.flat()).toEqual(responseToClaimSection);
    });
  });

  describe('Full Defence -  Claimant intention to proceed ', () => {
    it('Small Claim - FD and respondent reject free mediation. ', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.FULL_DEFENCE, undefined);
      claim.totalClaimAmount = 1500;
      claim.rejectAllOfClaim = {
        'option': 'dispute',
        'defence': {'text': 'disagree statement'},
      };

      claim.ccdState = CaseState.JUDICIAL_REFERRAL;
      claim.claimantResponse.intentionToProceed = new GenericYesNo(YesNo.YES);

      claim.mediation = new Mediation(undefined, {option: YesNo.NO}, undefined, undefined);
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(3);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.WAIT_FOR_THE_COURT_TO_REVIEW_THE_CASE');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.REJECTED_YOUR_RESPONSE');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.THE_COURT_WILL_REVIEW_THE_CASE');
    });

    it('Fast Track Claim - FD', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.FULL_DEFENCE, undefined);
      claim.totalClaimAmount = 15000;
      claim.rejectAllOfClaim = {
        'option': 'dispute',
        'defence': {'text': 'disagree statement'},
      };

      claim.ccdState = CaseState.JUDICIAL_REFERRAL;
      claim.claimantResponse.intentionToProceed = new GenericYesNo(YesNo.YES);

      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(3);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.WAIT_FOR_THE_COURT_TO_REVIEW_THE_CASE');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.REJECTED_YOUR_RESPONSE');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.THE_COURT_WILL_REVIEW_THE_CASE');
    });
  });
  describe('test buildResponseToClaimSectionForClaimant ', () => {
    it('test Response to claim link ', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.BY_SET_DATE);
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      // When
      const responseToClaimSection = buildResponseToClaimSectionForClaimant(claim, lng);
      // Then
      expect(responseToClaimSection.length).toBe(1);
      expect(responseToClaimSection[0].data.text).toBe('COMMON.BUTTONS.RESPOND_TO_CLAIM');
    });
  });
});
