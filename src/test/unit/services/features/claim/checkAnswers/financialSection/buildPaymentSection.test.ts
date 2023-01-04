import {
  createCCJClaimWithClaimResponseDetailsForPayByInstalments,
  createCCJClaimWithClaimResponseDetailsForPayBySetDate,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import {getSummarySections} from 'services/features/claimantResponse/ccj/ccjCheckAnswersService';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {
  CCJ_PAID_AMOUNT_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const YES_OPTION = 'Yes';
const BY_SET_DATE = 'By a set date';
const DATE = '25 December 2023';
const AMOUNT_ALREADY_PAID = '£200';
const INSTALMENTS = 'By instalments';
const AMOUNT_TO_BE_PAID = '£800';
const FIRST_PAYMENT_DATE = '6 June 2023';
const INSTALMENTS_OF = '£200';
const PAYMENT_FREQUENCY = 'Each week';

describe('Payment Section', () => {

  it('should return your Payment summary sections for pay by set date', async () => {
    //When
    const claim = createCCJClaimWithClaimResponseDetailsForPayBySetDate();
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.PAYMENT_TITLE');
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows.length).toBe(5);
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[0].value.html).toBe(YES_OPTION);
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(constructResponseUrlWithIdParams(constVal.CLAIM_ID, CCJ_PAID_AMOUNT_URL));
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CCJ_HAS_DEFENDANT_PAID_SOME');
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[1].value.html).toBe(AMOUNT_ALREADY_PAID);
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CCJ_AMOUNT_ALREADY_PAID');
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[2].value.html).toBe(AMOUNT_TO_BE_PAID);
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CCJ_TOTAL_TO_BE_PAID');
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[3].value.html).toBe(BY_SET_DATE);
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CCJ_HOW_TO_PAY');
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[4].value.html).toBe(DATE);
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CCJ_WHEN_DO_YOU_WANT_TO_BE_PAID_BY');
  });

  it('should return your Payment summary sections for pay by instalments', async () => {
    //When
    const claim = createCCJClaimWithClaimResponseDetailsForPayByInstalments();
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[3].value.html).toBe(INSTALMENTS);
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CCJ_HOW_TO_PAY');
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[4].value.html).toBe(INSTALMENTS_OF);
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CCJ_INSTALMENTS_OF');
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[5].value.html).toBe(FIRST_PAYMENT_DATE);
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CCJ_FIRST_PAYMENT_DATE');
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[6].value.html).toBe(PAYMENT_FREQUENCY);
    expect(summarySections.sections[constVal.INDEX_CCJ_PAYMENT_SECTION].summaryList.rows[6].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CCJ_INSTALMENTS_PAYMENT_FREQUENCY');
  });

});
