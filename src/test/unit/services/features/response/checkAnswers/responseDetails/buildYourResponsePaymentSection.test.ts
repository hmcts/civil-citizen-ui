import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  createClaimWithBasicRespondentDetails,
  createClaimWithRespondentDetailsWithPaymentOption,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import {
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_RESPONSE_TYPE_URL,
} from '../../../../../../../main/routes/urls';
import PaymentOptionType
  from '../../../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import * as constVal from '../../../../../../utils/checkAnswersConstants';


jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Response Payment Section', () => {
  const claim = createClaimWithBasicRespondentDetails();

  it('should return your response summary section', async () => {
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
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
  });
  it('should return response summary section with payment option type instalments', async () => {
    //Given
    const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.INSTALMENTS);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows.length).toBe(5);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY_TITLE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.REGULAR_PAYMENTS');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PAYMENT_FREQUENCY');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.FIRST_PAYMENT');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[4].key.text).toBe('PAGES.EXPLANATION.TITLE');
  });
  it('should return response summary section with payment option by set date', async () => {
    //Given
    const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.BY_SET_DATE);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows.length).toBe(2);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY_TITLE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHEN_PAY');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[1].key.text).toBe('PAGES.EXPLANATION.TITLE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_PAYMENT_SECTION].summaryList.rows[0].value.html).toContain('COMMON.PAYMENT_OPTION.BY_SET_DATE: 25 June 2022');
  });
});
