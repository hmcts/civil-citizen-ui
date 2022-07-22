import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  createClaimWithBasicRespondentDetails,
  createClaimWithPaymentOption,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import {
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_RESPONSE_TYPE_URL,
  CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL,
  CITIZEN_REPAYMENT_PLAN_PARTIAL_URL,
} from '../../../../../../../main/routes/urls';
import PaymentOptionType
  from '../../../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {formatDateToFullDate} from '../../../../../../../main/common/utils/dateUtils';
import { ResponseType } from '../../../../../../../main/common/form/models/responseType';


jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Response Payment Section', () => {

  it('should return your response summary section', async () => {
    //Given
    const claim = createClaimWithBasicRespondentDetails();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows.length).toBe(2);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[1].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_PAYMENT_OPTION_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHEN_PAY);
  });
  it('should return response summary section with payment option type instalments', async () => {
    //Given
    const claim = createClaimWithPaymentOption(ResponseType.FULL_ADMISSION, PaymentOptionType.INSTALMENTS);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows.length).toBe(5);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].title).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHEN_PAY_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHEN_PAY);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_REGULAR_PAYMENTS);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_PAYMENT_FREQUENCY);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[3].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FIRST_PAYMENT);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[4].key.text).toBe(constVal.PAGES_EXPLANATION_TITLE);
  });
  it('should return response summary section with payment option by set date', async () => {
    //Given
    const claim = createClaimWithPaymentOption(ResponseType.FULL_ADMISSION, PaymentOptionType.BY_SET_DATE);

    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows.length).toBe(2);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].title).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHEN_PAY_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHEN_PAY);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].value.html).toContain(constVal.COMMON_PAYMENT_OPTION_BY_SET_DATE + ': ' + formatDateToFullDate(new Date(Date.now() + (3600 * 1000 * 24))));
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_PAYMENT_OPTION_URL.replace(':id', constVal.CLAIM_ID));
  });

  it('should return reasons why can\'t pay when payment is set to \'BY_SET_DATE\' ', async () => {
    //Given
    const claim = createClaimWithPaymentOption(ResponseType.FULL_ADMISSION, PaymentOptionType.BY_SET_DATE);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_EXPLANATION_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[1].value.html).toBe('Reasons cannot pay immediately');
  });

  it('should return reasons why can\'t pay when payment is set to \'INSTALMENTS\' ', async () => {
    //Given
    const claim = createClaimWithPaymentOption(ResponseType.FULL_ADMISSION, PaymentOptionType.INSTALMENTS);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[4].key.text).toBe(constVal.PAGES_EXPLANATION_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[4].value.html).toBe('Reasons cannot pay immediately');
  });
});

describe('Response Payment Section - PART ADMIT', () => {
  it('should return your response summary section when payment is set to \'IMMEDIATELY\'', async () => {
    //Given
    const claim = createClaimWithPaymentOption(ResponseType.PART_ADMISSION, PaymentOptionType.IMMEDIATELY);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHEN_PAY);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL.replace(':id', constVal.CLAIM_ID));
  });

  it('should return your response summary section when payment is set to \'BY_SET_DATE\'', async () => {
    //Given
    const claim = createClaimWithPaymentOption(ResponseType.PART_ADMISSION, PaymentOptionType.BY_SET_DATE);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHEN_PAY);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].value.html).toBe(constVal.COMMON_PAYMENT_OPTION_BY_SET_DATE + ': ' + formatDateToFullDate(new Date(Date.now() + (3600 * 1000 * 24))));
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL.replace(':id', constVal.CLAIM_ID));
  });

  it('should return your response summary section when payment is set to \'INSTALMENTS\'', async () => {
    //Given
    const claim = createClaimWithPaymentOption(ResponseType.PART_ADMISSION, PaymentOptionType.INSTALMENTS);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHEN_PAY);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].value.html).toBe('COMMON.PAYMENT_OPTION.INSTALMENTS');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_REGULAR_PAYMENTS);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[1].value.html).toBe('£33');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_PAYMENT_FREQUENCY);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[2].value.html).toBe('COMMON.PAYMENT_FREQUENCY.WEEK');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[2].actions?.items[0].href).toBe(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[3].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FIRST_PAYMENT);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[3].value.html).toBe(formatDateToFullDate(new Date(Date.now() + (3600 * 1000 * 24))));
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[3].actions?.items[0].href).toBe(CITIZEN_REPAYMENT_PLAN_PARTIAL_URL.replace(':id', constVal.CLAIM_ID));
  });

  it('should return reasons why can\'t pay when payment is set to \'BY_SET_DATE\' ', async () => {
    //Given
    const claim = createClaimWithPaymentOption(ResponseType.PART_ADMISSION, PaymentOptionType.BY_SET_DATE);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_EXPLANATION_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[1].value.html).toBe('Reasons cannot pay immediately');
  });

  it('should return reasons why can\'t pay when payment is set to \'INSTALMENTS\' ', async () => {
    //Given
    const claim = createClaimWithPaymentOption(ResponseType.PART_ADMISSION, PaymentOptionType.INSTALMENTS);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[4].key.text).toBe(constVal.PAGES_EXPLANATION_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[4].value.html).toBe('Reasons cannot pay immediately');
  });
});
