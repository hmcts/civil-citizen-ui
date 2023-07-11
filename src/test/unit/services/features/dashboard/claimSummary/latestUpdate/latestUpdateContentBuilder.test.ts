import {DateTime, Settings} from 'luxon';
import {Claim} from 'models/claim';
import {buildResponseToClaimSection} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContentBuilder';
import {CaseState} from 'form/models/claimDetails';
import {PartyType} from 'models/partyType';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {BILINGUAL_LANGUAGE_PREFERENCE_URL} from 'routes/urls';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {ResponseType} from 'form/models/responseType';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {FullAdmission} from 'models/fullAdmission';
import { addDaysToDate, formatDateToFullDate } from 'common/utils/dateUtils';
import {
  getAmount,
  getFirstRepaymentDate,
  getPaymentAmount,
  getPaymentDate, getRepaymentFrequency,
} from 'common/utils/repaymentUtils';
import currencyFormat from 'common/utils/currencyFormat';
import {PartialAdmission} from 'models/partialAdmission';
import {LatestUpdateSectionBuilder} from 'common/models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {t} from 'i18next';
import {DocumentType, DocumentUri} from 'models/document/documentType';

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
  claim.partialAdmission.paymentIntention = new PaymentIntention();
  claim.partialAdmission.paymentIntention.paymentOption = paymentOptionType;
  claim.partialAdmission.paymentIntention.paymentDate = new Date(Date.now());
  claim.partialAdmission.paymentIntention.repaymentPlan = {
    paymentAmount: 100,
    repaymentFrequency: 'Monthly',
    firstRepaymentDate: new Date(Date.now()),
  };
  return claim;
};

const getClaimDetails = (partyType: PartyType, responseType: ResponseType) => {
  const claim = new Claim();
  claim.id = '1';
  claim.totalClaimAmount = 1000;
  claim.respondent1 = {
    responseType: responseType,
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
  return claim;
};

const getClaimWithSdoDocument = () =>  {
  const claim = new Claim();
  claim.id = '001';
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

const getLastUpdateSdoDocumentExpected = (claimId: string) => {
  return new LatestUpdateSectionBuilder()
    .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_AN_ORDER_HAS_BEEN_ISSUED_BY_THE_COURT`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_PLEASE_FOLLOW_THE_INSTRUCTIONS_IN_THE_ORDER`)
    .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_THIS_CLAIM_WILL_NO_PROCEED_OFFLINE`)
    .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.SDO_DOWNLOAD_THE_COURTS_ORDER`, claimId, DocumentUri.SDO_ORDER, null, `${PAGES_LATEST_UPDATE_CONTENT}.SDO_TO_FIND_OUT_THE_DETAILS`)
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
  const claimId = '5129';
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
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_SAID_YOU_WILL_PAY`, {
            claimantName: claim.getClaimantFullName(),
            amount: currencyFormat(getAmount(claim)),
            paymentDate: formatDateToFullDate(getPaymentDate(claim), lng),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.IF_YOU_PAY_BY_CHEQUE`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.IF_THEY_DONT_RECEIVE_THE_MONEY_BY_THEN`)
          .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.CONTACT`, claim.id, {claimantName: claim.getClaimantFullName()})
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.DEFENDANT_DEFENCE)
          .build();

        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId, lng);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Full Admit Pay Set Date + Defendant ISNOT Company or ORG', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.FULL_ADMISSION, PaymentOptionType.BY_SET_DATE);
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_BY`, {
            claimantName: claim.getClaimantFullName(),
            paymentDate: formatDateToFullDate(getPaymentDate(claim), lng),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.DEFENDANT_DEFENCE)
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
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_BY`, {
            claimantName: claim.getClaimantFullName(),
            paymentDate: formatDateToFullDate(getPaymentDate(claim), lng),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
          .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.DEFENDANT_DEFENCE)
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
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_STARTING`, {
            claimantName: claim.getClaimantFullName(),
            installmentAmount:  currencyFormat(getPaymentAmount(claim)),
            paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
            paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.DEFENDANT_DEFENCE)
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
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_OFFERED_TO_PAY_STARTING`, {
            claimantName: claim.getClaimantFullName(),
            installmentAmount:  currencyFormat(getPaymentAmount(claim)),
            paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
            paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
          .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.DEFENDANT_DEFENCE)
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
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_IMMEDIATELY`, {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.DEFENDANT_DEFENCE)
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
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
            paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
          .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.DEFENDANT_DEFENCE)
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
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
            paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),lng),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.DEFENDANT_DEFENCE)
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
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARTING`, {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
            installmentAmount: currencyFormat(getPaymentAmount(claim)),
            paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
            paymentDate: formatDateToFullDate(getPaymentDate(claim),lng),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
          .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}.GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.DEFENDANT_DEFENCE)
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
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARTING`, {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
            installmentAmount: currencyFormat(getPaymentAmount(claim)),
            paymentSchedule: t(`COMMON.PAYMENT_FREQUENCY.${getRepaymentFrequency(claim)}`, {lng}),
            paymentDate: formatDateToFullDate(getPaymentDate(claim),lng),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.DEFENDANT_DEFENCE)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay Already Paid - Claimant accepted already paid and settled', () => {
        // Given
        const claim = getClaimDetails(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION);
        claim.partialAdmission = {
          alreadyPaid: {
            option: 'yes',
          },
        } as any;
        claim.applicant1PartAdmitConfirmAmountPaidSpec = 'Yes';
        claim.applicant1PartAdmitIntentionToSettleClaimSpec = 'Yes';
        claim.partAdmitPaidValuePounds = 500;
        claim.respondent1PaymentDateToStringSpec = new Date(0);
        const claimId = claim.id;
        const claimantFullName = claim.getClaimantFullName();
        const amount = claim?.partAdmitPaidValuePounds;
        const moneyReceivedOn = formatDateToFullDate(claim.respondent1PaymentDateToStringSpec, lng);
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIM_SETTLED`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.CLAIMANT_CONFIRMED_YOU_PAID`, { claimantName: claimantFullName, amount, moneyReceivedOn })
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay Already Paid - Claimant accepted already paid and not settled', () => {
        // Given
        const claim = getClaimDetails(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION);
        claim.partialAdmission = {
          alreadyPaid: {
            option: 'yes',
          },
        } as any;
        claim.applicant1PartAdmitConfirmAmountPaidSpec = 'Yes';
        claim.applicant1PartAdmitIntentionToSettleClaimSpec = 'No';
        claim.partAdmitPaidValuePounds = 500;
        const claimId = claim.id;
        const partAmount = claim.partAdmitPaidValuePounds;
        const fullAmount = claim.totalClaimAmount;
        const lastUpdateSectionExpected = new LatestUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}.WAIT_FOR_THE_COURT_TO_REVIEW_THE_CASE`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.THEY_ACCEPT_THAT_YOU_HAVE_PAID_THEM`, { partAmount, fullAmount })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}.YOU_MIGHT_HAVE_TO_GO_TO_A_COURT_HEARING`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay Already Paid - Claimant rejected already paid', () => {
        // Given
        const claim = getClaimDetails(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION);
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
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claimId, DocumentUri.SEALED_CLAIM)
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
      const lastUpdateSdoDocumentExpected = getLastUpdateSdoDocumentExpected(claim.id);

      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);

      // Then
      expect(responseToClaimSection.length).toBe(4);
      expect(lastUpdateSdoDocumentExpected.flat()).toEqual(responseToClaimSection);
    });
  });
});
