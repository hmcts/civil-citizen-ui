import {SummarySections} from '../../../../../../../main/common/models/summaryList/summarySections';
import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  CITIZEN_RESPONSE_TYPE_URL,
  CITIZEN_ALREADY_PAID_URL,
  CITIZEN_BANK_ACCOUNT_URL,
  CITIZEN_CARER_URL,
  CITIZEN_COURT_ORDERS_URL,
  CITIZEN_DEPENDANTS_URL,
  CITIZEN_DISABILITY_URL,
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_PARTNER_URL,
  CITIZEN_RESIDENCE_URL,
  CITIZEN_REJECT_ALL_CLAIM_URL,
} from '../../../../../../../main/routes/urls';
import {
  ceateClaimWithPartialAdmission,
  createClaimWithRespondentDetailsWithPaymentOption,
  createClaimWithFullRejection,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import PaymentOptionType from '../../../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {
  PaymentIntention,
} from '../../../../../../../main/common/form/models/admission/partialAdmission/paymentIntention';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {YesNo} from '../../../../../../../main/common/form/models/yesNo';
import RejectAllOfClaimType from '../../../../../../../main/common/form/models/rejectAllOfClaimType';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));


describe('Response To Claim', () => {
  const resultExpected = (summarySections: SummarySections) => {
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE');

    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].value.html).toBe('COMMON.RESPONSE_TYPE.FULL_ADMISSION');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', constVal.CLAIM_ID));
  };

  it('should return response to claim when financial detail section exists with payment option type instalments', async () => {
    //Given
    const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.INSTALMENTS);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    resultExpected(summarySections);
  });

  it('should return response to claim when financial detail section exists with payment option type by set date', async () => {
    //Given
    const claim = createClaimWithRespondentDetailsWithPaymentOption(PaymentOptionType.BY_SET_DATE);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    resultExpected(summarySections);
  });

  it('should return paid the claimant on response to claim when response detail section exists', async () => {
    //Given
    const claim = ceateClaimWithPartialAdmission(YesNo.YES);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[0].value.html).toBe('COMMON.RESPONSE_TYPE.PART_ADMISSION');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_HAVE_YOU_PAID_THE_CLAIMANT');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].value.html).toBe('COMMON.YES');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_ALREADY_PAID_URL.replace(':id', constVal.CLAIM_ID));
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
  it('should return not paid the claimant on response to claim when response detail section exists', async () => {
    //Given
    const claim = ceateClaimWithPartialAdmission(YesNo.NO);
    //When
    if (claim.partialAdmission) {
      claim.partialAdmission.paymentIntention = new PaymentIntention();
      claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
    }
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_HAVE_YOU_PAID_THE_CLAIMANT');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].value.html).toBe('COMMON.NO');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_ALREADY_PAID_URL.replace(':id', constVal.CLAIM_ID));
  });
});

describe('Reject Claim', () => {
  it('should return "I reject all of the claim" on response to claim when ALREADY_PAID', async () => {
    //Given
    const claim = createClaimWithFullRejection(RejectAllOfClaimType.ALREADY_PAID);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_WHY_DO_YOU_REJECT_ALL_OF_THIS_CLAIM');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].value.html).toBe('PAGES.CITIZEN_RESPONSE_TYPE.REJECT_ALL_CLAIM_TYPE.ALREADY_PAID');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_REJECT_ALL_CLAIM_URL.replace(':id', constVal.CLAIM_ID));
  });

  it('should return "I reject all of the claim" on response to claim when DISPUTE', async () => {
    //Given
    const claim = createClaimWithFullRejection(RejectAllOfClaimType.DISPUTE);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_WHY_DO_YOU_REJECT_ALL_OF_THIS_CLAIM');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].value.html).toBe('PAGES.CITIZEN_RESPONSE_TYPE.REJECT_ALL_CLAIM_TYPE.DISPUTE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_REJECT_ALL_CLAIM_URL.replace(':id', constVal.CLAIM_ID));
  });

  it('should return "I reject all of the claim" on response to claim when COUNTER_CLAIM', async () => {
    //Given
    const claim = createClaimWithFullRejection(RejectAllOfClaimType.COUNTER_CLAIM);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_WHY_DO_YOU_REJECT_ALL_OF_THIS_CLAIM');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].value.html).toBe('PAGES.CITIZEN_RESPONSE_TYPE.REJECT_ALL_CLAIM_TYPE.COUNTER_CLAIM');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_REJECT_ALL_CLAIM_URL.replace(':id', constVal.CLAIM_ID));
  });
});
