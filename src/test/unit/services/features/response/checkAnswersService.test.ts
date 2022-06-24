import {
  getSignatureType,
  getStatementOfTruth,
  getSummarySections,
  resetCheckboxFields,
  saveStatementOfTruth,
} from '../../../../../main/services/features/response/checkAnswersService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_PHONE_NUMBER_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  DOB_URL,
} from '../../../../../main/routes/urls';
import {TestMessages} from '../../../../../../src/test/utils/errorMessageTestConstants';
import PaymentOptionType
  from '../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {StatementOfTruthForm} from '../../../../../main/common/form/models/statementOfTruth/statementOfTruthForm';
import {SignatureType} from '../../../../../main/common/models/signatureType';
import {
  createClaimWithBasicRespondentDetails,
  createClaimWithRespondentDetailsWithPaymentOption,
  createClaimWithIndividualDetails,
  createClaimWithContactPersonDetails,
} from '../../../../utils/mockClaimForCheckAnswers';
import {Respondent} from '../../../../../main/common/models/respondent';
import {QualifiedStatementOfTruth} from '../../../../../main/common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {CounterpartyType} from '../../../../../main/common/models/counterpartyType';
import {Claim} from '../../../../../main/common/models/claim';
import {SummarySections} from '../../../../../main/common/models/summaryList/summarySections';
import {
  CLAIM_ID,
  INDEX_DETAILS_SECTION,
  INDEX_RESPONSE_CLAIM_SECTION,
  INDEX_RESPONSE_SECTION,
} from '../../../../utils/checkAnswersConstants';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const CONTACT_PERSON = 'The Post Man';
const PARTY_NAME = 'Nice organisation';
const TITLE = 'Mr';
const FIRST_NAME = 'John';
const LAST_NAME = 'Richards';
const FULL_NAME = `${TITLE} ${FIRST_NAME} ${LAST_NAME}`;
const CONTACT_NUMBER = '077777777779';
const ADDRESS = '23 Brook lane<br>Bristol<br>BS13SS';
const CORRESPONDENCE_ADDRESS = '24 Brook lane<br>Bristol<br>BS13SS';
const DOB = '12 December 2000';
const expectedStatementOfTruth = {
  isFullAmountRejected: false,
  type: 'basic',
  directionsQuestionnaireSigned: '',
  signed: '',
};

describe('Check Answers service', () => {
  describe('Get Summary Sections', () => {
    const claim = createClaimWithBasicRespondentDetails();
    it('should return your details summary sections', async () => {
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections.length).toBe(4);
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows.length).toBe(5);
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows[0].value.html).toBe(PARTY_NAME);
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_DETAILS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows[1].value.html).toBe(ADDRESS);
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows[1].actions?.items.length).toBe(1);
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_DETAILS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows[2].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS');
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows[2].actions?.items[0].href).toBe(CITIZEN_DETAILS_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows[4].value.html).toBe(CONTACT_NUMBER);
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_PHONE_NUMBER_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows[3].value.html).toBe(DOB);
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows[3].actions?.items[0].href).toBe(DOB_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[INDEX_DETAILS_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE');
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.FULL_NAME');
      expect(summarySections.sections[INDEX_DETAILS_SECTION].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER');
    });
    it('should return your response to claim section', async () => {
      //Given
      const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.BY_SET_DATE);
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      expect(summarySections.sections[INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
      expect(summarySections.sections[INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[INDEX_RESPONSE_CLAIM_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE');
    });
    it('should return your response summary section', async () => {
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows.length).toBe(2);
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows[1].actions?.items.length).toBe(1);
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_PAYMENT_OPTION_URL.replace(':id', CLAIM_ID));
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE');
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
    });
    it('should return response summary section with payment option type instalments', async () => {
      //Given
      const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.INSTALMENTS);
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows.length).toBe(5);
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY_TITLE');
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.REGULAR_PAYMENTS');
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PAYMENT_FREQUENCY');
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.FIRST_PAYMENT');
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows[4].key.text).toBe('PAGES.EXPLANATION.TITLE');
    });
    it('should return response summary section with payment option by set date', async () => {
      //Given
      const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.BY_SET_DATE);
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
      //Then
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows.length).toBe(2);
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY_TITLE');
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows[1].key.text).toBe('PAGES.EXPLANATION.TITLE');
      expect(summarySections.sections[INDEX_RESPONSE_SECTION].summaryList.rows[0].value.html).toContain('COMMON.PAYMENT_OPTION.BY_SET_DATE: 25 June 2022');
    });
    it('should throw error when retrieving data from draft store fails', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      //Then
      await expect(
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthForm(false, SignatureType.BASIC, 'true'))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
    it('should retrieve data from draft store', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.defendantStatementOfTruth = { isFullAmountRejected: false, type: SignatureType.BASIC, signed: 'true' };
        return claim;
      });

      //Then
      await expect(
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthForm(false, SignatureType.BASIC, 'true'))).toBeTruthy();
    });
    it('should return full name of a person when full name is present', async () => {
      //Given
      const claim = createClaimWithIndividualDetails();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[0].summaryList.rows[0].value.html).toBe(FULL_NAME);
    });
    it('should return contact person when contact person is specified', async () => {
      //Given
      const claim = createClaimWithContactPersonDetails();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[0].summaryList.rows[1].value.html).toBe(CONTACT_PERSON);
    });
    it('should return correspondence address when it exists', async () => {
      //Given
      const claim = createClaimWithIndividualDetails();
      //When
      const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
      //Then
      expect(summarySections.sections[0].summaryList.rows[2].value.html).toBe(CORRESPONDENCE_ADDRESS);
    });

    describe('Response To Claim', () => {
      const resultExpected = (summarySections: SummarySections) => {
        expect(summarySections.sections[INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
        expect(summarySections.sections[INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].value.html).toBe('COMMON.RESPONSE_TYPE.FULL_ADMISSION');
        expect(summarySections.sections[INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', CLAIM_ID));
      };

      it('should return response to claim when financial detail section exists with payment option type instalments', async () => {
        //Given
        const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.INSTALMENTS);
        //When
        const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
        //Then
        resultExpected(summarySections);
      });

      it('should return response to claim when financial detail section exists with payment option type by set date', async () => {
        //Given
        const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.BY_SET_DATE);
        //When
        const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
        //Then
        resultExpected(summarySections);
      });
    });
  });

  describe('resetCheckboxFields', () => {
    it('should set directionsQuestionnaireSigned and signed to empty string for statement of truth', () => {
      const statementOfTruth = new StatementOfTruthForm(false);
      expect(resetCheckboxFields(statementOfTruth)).toEqual(expectedStatementOfTruth);
    });

    it('should set directionsQuestionnaireSigned and signed to empty string for qualified statement of truth', () => {
      const qualifiedStatementOfTruth = new QualifiedStatementOfTruth(false);
      const expectedQualifiedStatementOfTruth = {
        ...expectedStatementOfTruth,
        type: 'qualified',
      };
      expect(resetCheckboxFields(qualifiedStatementOfTruth)).toEqual(expectedQualifiedStatementOfTruth);
    });
  });

  describe('getStatementOfTruth', () => {
    let claim: Claim;

    beforeEach(() => {
      claim = createClaimWithBasicRespondentDetails();
    });

    it('should return statement of truth if it is set in the draft store', () => {
      claim.defendantStatementOfTruth = new StatementOfTruthForm(false);
      expect(getStatementOfTruth(claim)).toEqual(expectedStatementOfTruth);
    });

    it('should create new statement of truth if signature type is basic', () => {
      expect(getStatementOfTruth(claim)).toEqual({isFullAmountRejected: false, type: 'basic'});
    });

    it('should create new qualified statement of truth if signature type is qualified', () => {
      claim.respondent1 = new Respondent();
      claim.respondent1.type = CounterpartyType.ORGANISATION;
      expect(getStatementOfTruth(claim)).toEqual({isFullAmountRejected: false, type: 'qualified'});
    });
  });

  describe('getSignatureType', () => {
    let claim: Claim;

    beforeEach(() => {
      claim = createClaimWithBasicRespondentDetails();
    });

    it('should return basic signature type if respondent is individual', () => {
      expect(getSignatureType(claim)).toEqual(SignatureType.BASIC);
    });

    it('should return basic signature type if respondent is sole trader', () => {
      claim.respondent1 = new Respondent();
      claim.respondent1.type = CounterpartyType.SOLE_TRADER;
      expect(getSignatureType(claim)).toEqual(SignatureType.BASIC);
    });

    it('should return basic signature type if respondent is company', () => {
      claim.respondent1 = new Respondent();
      claim.respondent1.type = CounterpartyType.COMPANY;
      expect(getSignatureType(claim)).toEqual(SignatureType.QUALIFIED);
    });

    it('should return basic signature type if respondent is organisation', () => {
      claim.respondent1 = new Respondent();
      claim.respondent1.type = CounterpartyType.ORGANISATION;
      expect(getSignatureType(claim)).toEqual(SignatureType.QUALIFIED);
    });
  });
});
