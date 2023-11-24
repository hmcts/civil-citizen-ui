import {SummarySections} from 'common/models/summaryList/summarySections';
import {
  getSummarySections,
} from 'services/features/response/checkAnswers/checkAnswersService';
import {
  CITIZEN_ALREADY_PAID_URL,
  CITIZEN_REJECT_ALL_CLAIM_URL,
  CITIZEN_RESPONSE_TYPE_URL,
} from 'routes/urls';
import {
  ceateClaimWithPartialAdmission,
  createClaimWithFullRejection,
  createClaimWithRespondentDetailsWithPaymentOption,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {
  PaymentIntention,
} from 'common/form/models/admission/paymentIntention';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {YesNo} from 'common/form/models/yesNo';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';

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
    const claim = ceateClaimWithPartialAdmission(YesNo.YES, PaymentOptionType.INSTALMENTS);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[0].value.html).toBe('COMMON.RESPONSE_TYPE.PART_ADMISSION');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_HAVE_YOU_PAID_THE_CLAIMANT');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].value.html).toBe('COMMON.VARIATION_2.YES');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_ALREADY_PAID_URL.replace(':id', constVal.CLAIM_ID));
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
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].value.html).toBe('COMMON.VARIATION_2.NO');
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
