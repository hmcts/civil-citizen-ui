import {DateTime, Settings} from 'luxon';
import {Claim} from 'models/claim';
import {
  buildResponseToClaimSection, LastUpdateSectionBuilder,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContentBuilder';
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
import {getLanguage} from 'modules/i18n/languageService';

import currencyFormat from 'common/utils/currencyFormat';
import {PartialAdmission} from 'models/partialAdmission';

jest.mock('../../../../../../../main/modules/i18n/languageService', () => ({
  getLanguage: jest.fn().mockReturnValue('en'),
  setLanguage: jest.fn(),
}));
const PAGES_LATEST_UPDATE_CONTENT = 'PAGES.LATEST_UPDATE_CONTENT.';
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

  describe('test buildResponseToClaimSection', () => {
    it('should have responseNotSubmittedTitle and respondToClaimLink', () => {
      // Given
      const expectedNow = DateTime.local(2022, 7, 1, 23, 0, 0);
      Settings.now = () => expectedNow.toMillis();
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId);
      // Then
      expect(responseToClaimSection.length).toBe(3);
      expect(responseToClaimSection[0].type).toEqual(ClaimSummaryType.TITLE);
      expect(responseToClaimSection[0].data?.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVENT_RESPONDED_TO_CLAIM');
      expect(responseToClaimSection[2].type).toEqual(ClaimSummaryType.LINK);
      expect(responseToClaimSection[2].data?.href).toEqual(bilingualLanguagePreferencetUrl);
    });

    it('should have deadlline extended title when defendant extended response deadline', () => {
      //Given
      claim.respondentSolicitor1AgreedDeadlineExtension = new Date();
      //When
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId);
      // Then
      expect(responseToClaimSection.length).toBe(3);
      expect(responseToClaimSection[0].type).toEqual(ClaimSummaryType.TITLE);
      expect(responseToClaimSection[0].data?.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.MORE_TIME_REQUESTED');
      expect(responseToClaimSection[2].type).toEqual(ClaimSummaryType.LINK);
      expect(responseToClaimSection[2].data?.href).toEqual(bilingualLanguagePreferencetUrl);
    });

    it('should have responseDeadlineNotPassedContent when defendant not responded before dead line', () => {
      // Given
      const expectedNow = DateTime.local(2022, 6, 1, 23, 0, 0);
      Settings.now = () => expectedNow.toMillis();
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId);
      // Then
      expect(responseToClaimSection[1].type).toEqual(ClaimSummaryType.PARAGRAPH);
    });
    it('should have responseDeadlinePassedContent when defendant not responded after dead line', () => {
      // Given
      const expectedNow = DateTime.local(2022, 8, 1, 23, 0, 0);
      Settings.now = () => expectedNow.toMillis();
      // When
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId);
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
      const responseToClaimSection = buildResponseToClaimSection(claim, claimId);
      // Then
      expect(responseToClaimSection.length).toBe(1);
    });
  });
  describe('Test latest Update when we response the claim', () => {
    describe('Full Admit Pay ', () => {
      it('Immediately', () => {
        // Given
        const claim = getClaim(PartyType.COMPANY, ResponseType.FULL_ADMISSION, PaymentOptionType.IMMEDIATELY);
        const lastUpdateSectionExpected = new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_SAID_YOU_WILL_PAY`, {
            claimantName: claim.getClaimantFullName(),
            amount: currencyFormat(getAmount(claim)),
            paymentDate: formatDateToFullDate(getPaymentDate(claim), getLanguage()),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}IF_YOU_PAY_BY_CHEQUE`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}IF_THEY_DONT_RECEIVE_THE_MONEY_BY_THEN`)
          .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}CONTACT`, claim.id, {claimantName: claim.getClaimantFullName()})
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();

        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Full Admit Pay Set Date + Defendant ISNOT Company or ORG', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.FULL_ADMISSION, PaymentOptionType.BY_SET_DATE);
        const lastUpdateSectionExpected = new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY`, {
            claimantName: claim.getClaimantFullName(),
            paymentDate: formatDateToFullDate(getPaymentDate(claim), getLanguage()),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();

        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Full Admit Pay Set Date + Defendant IS Company or ORG', () => {
        // Given
        const claim = getClaim(PartyType.COMPANY, ResponseType.FULL_ADMISSION, PaymentOptionType.BY_SET_DATE);
        const lastUpdateSectionExpected = new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY`, {
            claimantName: claim.getClaimantFullName(),
            paymentDate: formatDateToFullDate(getPaymentDate(claim), getLanguage()),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
          .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Full Admit Pay Instalments + Defendant ISNOT Company or ORG ', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.FULL_ADMISSION, PaymentOptionType.INSTALMENTS);
        const lastUpdateSectionExpected = new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY_STARTING`, {
            claimantName: claim.getClaimantFullName(),
            installmentAmount:  currencyFormat(getPaymentAmount(claim)),
            paymentSchedule: getRepaymentFrequency(claim),
            paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),getLanguage()),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Full Admit Pay Instalments+ Defendant IS Company or ORG', () => {
        // Given
        const claim = getClaim(PartyType.COMPANY, ResponseType.FULL_ADMISSION, PaymentOptionType.INSTALMENTS);
        const lastUpdateSectionExpected = new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_OFFERED_TO_PAY_STARTING`, {
            claimantName: claim.getClaimantFullName(),
            installmentAmount:  currencyFormat(getPaymentAmount(claim)),
            paymentSchedule: getRepaymentFrequency(claim),
            paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),getLanguage()),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
          .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
    });
    describe('Part Admit Pay', () => {
      it('Immediately', () => {
        // Given
        const claim = getClaim(PartyType.COMPANY, ResponseType.PART_ADMISSION, PaymentOptionType.IMMEDIATELY);
        const lastUpdateSectionExpected = new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_IMMEDIATELY`, {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();

        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay SET DATE - Defendant IS Org or Company', () => {
        // Given
        const claim = getClaim(PartyType.COMPANY, ResponseType.PART_ADMISSION, PaymentOptionType.BY_SET_DATE);
        const lastUpdateSectionExpected = new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
            paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),getLanguage()),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
          .addContactLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claimId);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay SET DATE - Defendant IS NOT Org or Company', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.BY_SET_DATE);
        const lastUpdateSectionExpected = new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_BY`, {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
            paymentDate: formatDateToFullDate(getFirstRepaymentDate(claim),getLanguage()),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay Instalments - Defendant IS Org or Company', () => {
        // Given
        const claim = getClaim(PartyType.COMPANY, ResponseType.PART_ADMISSION, PaymentOptionType.INSTALMENTS);
        const lastUpdateSectionExpected = new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARTING`, {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
            installmentAmount: currencyFormat(getPaymentAmount(claim)),
            paymentSchedule: getRepaymentFrequency(claim),
            paymentDate: formatDateToFullDate(getPaymentDate(claim),getLanguage()),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_NEED_TO_SEND_THEM_YOUR_COMPANY_FINANCIAL`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}GET_CONTACT_DETAILS`, claim.id, {claimantName: claim.getClaimantFullName()})
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
      it('Part Admit Pay Instalments - Defendant IS NOT Org or Company', () => {
        // Given
        const claim = getClaim(PartyType.INDIVIDUAL, ResponseType.PART_ADMISSION, PaymentOptionType.INSTALMENTS);
        const lastUpdateSectionExpected = new LastUpdateSectionBuilder()
          .addTitle(`${PAGES_LATEST_UPDATE_CONTENT}YOUR_RESPONSE_TO_THE_CLAIM`)
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}YOU_HAVE_SAID_YOU_OWE_AND_OFFERED_TO_PAY_STARTING`, {
            amount: currencyFormat(getAmount(claim)),
            claimantName: claim.getClaimantFullName(),
            installmentAmount: currencyFormat(getPaymentAmount(claim)),
            paymentSchedule: getRepaymentFrequency(claim),
            paymentDate: formatDateToFullDate(getPaymentDate(claim),getLanguage()),
          })
          .addParagraph(`${PAGES_LATEST_UPDATE_CONTENT}WE_WILL_CONTACT_YOU_WHEN_THEY_RESPOND`)
          .addResponseDocumentLink(`${PAGES_LATEST_UPDATE_CONTENT}DOWNLOAD_YOUR_RESPONSE`, claim.id)
          .build();
        // When
        const responseToClaimSection = buildResponseToClaimSection(claim, claim.id);

        // Then
        expect(lastUpdateSectionExpected.flat()).toEqual(responseToClaimSection);
      });
    });
  });
});
