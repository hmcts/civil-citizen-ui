import {SummarySections} from '../../../../../../../main/common/models/summaryList/summarySections';
import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  CITIZEN_RESPONSE_TYPE_URL,
} from '../../../../../../../main/routes/urls';
import {
  ceateClaimWithPartialAdmission,
  createClaimWithRespondentDetailsWithPaymentOption,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import PaymentOptionType from '../../../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {YesNo} from '../../../../../../../main/common/form/models/yesNo';

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
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].value.html).toBe('Yes');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', constVal.CLAIM_ID));
  });

  it('should return not paid the claimant on response to claim when response detail section exists', async () => {
    //Given
    const claim = ceateClaimWithPartialAdmission(YesNo.NO);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_HAVE_YOU_PAID_THE_CLAIMANT');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].value.html).toBe('No');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_CLAIM_SECTION_PART_ADMISSION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_RESPONSE_TYPE_URL.replace(':id', constVal.CLAIM_ID));
  });
});
