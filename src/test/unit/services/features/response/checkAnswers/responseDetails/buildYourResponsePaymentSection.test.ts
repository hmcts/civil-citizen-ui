import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  ceateClaimWithPartialAdmission,
  createClaimWithBasicRespondentDetails,
  createClaimWithRespondentDetailsWithPaymentOption,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import {
  CITIZEN_BANK_ACCOUNT_URL,
  CITIZEN_CARER_URL,
  CITIZEN_COURT_ORDERS_URL,
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_DISABILITY_URL,
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_PARTNER_URL,
  CITIZEN_PAYMENT_OPTION_URL,
  CITIZEN_RESIDENCE_URL,
  CITIZEN_RESPONSE_TYPE_URL,
} from '../../../../../../../main/routes/urls';
import PaymentOptionType from '../../../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {YesNo} from '../../../../../../../main/common/form/models/yesNo';
import {
  PaymentIntention,
} from '../../../../../../../main/common/form/models/admission/partialAdmission/paymentIntention';


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
  it('should return paid the claimant on response to claim when response financial section exists', async () => {
    //Given
    const claim = ceateClaimWithPartialAdmission(YesNo.YES);
    //When
    if (claim.partialAdmission) {
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    }
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.BANK_AND_SAVINGS_ACCOUNTS');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[0].value.html).toBe('None');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_BANK_ACCOUNT_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.DISABILITY_ARE_YOU_DISABLED');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[1].value.html).toBe('COMMON.NO');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_DISABILITY_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.WHERE_DO_YOU_LIVE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[2].value.html).toBe(undefined);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[2].actions?.items[0].href).toBe(CITIZEN_RESIDENCE_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.PARTNER_DO_YOU_LIVE_WITH_A');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[3].value.html).toBe('COMMON.NO');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[3].actions?.items[0].href).toBe(CITIZEN_PARTNER_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CHILDREN');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[4].value.html).toBe('');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_DEPENDANTS_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CHILDREN_DO_YOU_HAVE_ANY_LIVE_WITH_YOU');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[5].value.html).toBe('COMMON.NO');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[5].actions?.items[0].href).toBe(CITIZEN_DEPENDANTS_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[6].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CARER_CREDIT_DO_YOU_CLAIM');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[6].value.html).toBe('COMMON.NO');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[6].actions?.items[0].href).toBe(CITIZEN_CARER_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[7].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_DETAILS');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[7].value.html).toBe('');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[7].actions?.items[0].href).toBe(CITIZEN_EMPLOYMENT_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[8].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_DO_YOU_HAVE_A_JOB');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[8].value.html).toBe('COMMON.NO');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[8].actions?.items[0].href).toBe(CITIZEN_EMPLOYMENT_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[9].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_TYPE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[9].value.html).toBe(undefined);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[9].actions?.items[0].href).toBe(undefined);

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[10].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[10].value.html).toBe('COMMON.NO');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION_PART_ADMISSION].summaryList.rows[10].actions?.items[0].href).toBe(CITIZEN_COURT_ORDERS_URL.replace(':id', constVal.CLAIM_ID));

  });
});
