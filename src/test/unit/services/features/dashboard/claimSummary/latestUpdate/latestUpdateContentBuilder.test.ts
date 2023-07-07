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
import {formatDateToFullDate} from 'common/utils/dateUtils';
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
import {YesNo} from 'common/form/models/yesNo';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {HowMuchHaveYouPaid} from 'common/form/models/admission/howMuchHaveYouPaid';
import {MediationAgreement} from 'models/mediation/mediationAgreement';
import {CaseDocument} from 'common/models/document/caseDocument';
import {Document} from 'common/models/document/document';

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

    it('should have deadlline extended title when defendant extended response deadline', () => {
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
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.SEALED_CLAIM)
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
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.SEALED_CLAIM)
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
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.SEALED_CLAIM)
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
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.SEALED_CLAIM)
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
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.SEALED_CLAIM)
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
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.SEALED_CLAIM)
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
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.SEALED_CLAIM)
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
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.SEALED_CLAIM)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay Instalments - Defendant IS Org or Company', () => {
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
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.SEALED_CLAIM)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay Instalments - Defendant IS NOT Org or Company', () => {
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
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}.DOWNLOAD_YOUR_RESPONSE`, claim.id, DocumentUri.SEALED_CLAIM)
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
      expect(responseToClaimSection[3].data.href).toBe('/case/1/documents/sealed-claim');
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
      expect(responseToClaimSection[3].data.href).toBe('/case/1/documents/sealed-claim');
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
      expect(responseToClaimSection[3].data.href).toBe('/case/1/documents/sealed-claim');
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
      expect(responseToClaimSection.length).toBe(3);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVE_SETTLED_CLAIM_TITLE');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVE_SETTLED_CLAIM');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CONTACT');
      expect(responseToClaimSection[2].data.href).toBe('/dashboard/1/contact-them');
      expect(responseToClaimSection[3]).toBeUndefined();
    });
  });

  describe('test Claim mediation unsuccessfull buildResponseToClaimSection', () => {
    it('should have build mediation unsuccessfull section', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.INSTALMENTS);
      claim.unsuccessfulMediationReason ='test';
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
      expect(responseToClaimSection[6].data.href).toBe('/case/1/documents/sealed-claim');
      expect(responseToClaimSection[7]).toBeUndefined();
    });
  });

  describe('test Claim Settled buildResponseToClaimSection', () => {
    it('should have build claim settled section part admit already paid scenario', () => {
      // Given
      const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.INSTALMENTS);
      claim.ccdState = CaseState.CASE_SETTLED;
      claim.lastModifiedDate = new Date();
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claim.id, lng);
      // Then
      expect(responseToClaimSection.length).toBe(3);
      expect(responseToClaimSection[0].data.text).toBe('PAGES.DASHBOARD.STATUS.CLAIM_SETTLED');
      expect(responseToClaimSection[1].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.CLAIMANT_CONFIRMED_SETTLED_CLAIM');
      expect(responseToClaimSection[2].data.text).toBe('PAGES.LATEST_UPDATE_CONTENT.DOWNLOAD_YOUR_RESPONSE');
      expect(responseToClaimSection[2].data.href).toBe('/case/1/documents/sealed-claim');
      expect(responseToClaimSection[3]).toBeUndefined();
    });
  });
});
