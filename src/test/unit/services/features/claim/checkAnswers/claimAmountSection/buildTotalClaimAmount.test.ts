import {getSummarySections} from '../../../../../../../main/services/features/claim/checkAnswers/checkAnswersService';
import {createClaimWithTotalAmount} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {SameRateInterestType} from '../../../../../../../main/common/form/models/claimDetails';
import {YesNo} from '../../../../../../../main/common/form/models/yesNo';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Total Claim Amount Section', () => {
  it('should return your total claim amount sections and interest to date if claim interest option is YES', async () => {
    const claim = createClaimWithTotalAmount(YesNo.YES, SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE, 10, 'My preference');
    //When Interest to date	£105.83   Total	£9,670.83
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 455, 'cimode');
    //Then
    expect(summarySections.sections[3].summaryList.rows.length).toBe(4);
    expect(summarySections.sections[3].title).toBe('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.TITLE');
    expect(summarySections.sections[3].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.CLAIM_AMOUNT');
    expect(summarySections.sections[3].summaryList.rows[0].value.html).toBe('£9,110');
    expect(summarySections.sections[3].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.INTEREST_TO_DATE');
    expect(summarySections.sections[3].summaryList.rows[1].value.html).toBe('£132.28');
    expect(summarySections.sections[3].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.CLAIM_FEE');
    expect(summarySections.sections[3].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.TOTAL');
    expect(summarySections.sections[3].summaryList.rows[3].value.html).toBe('£9,697.28');
  });

  it('should return your total claim amount sections and interest to date if claim interest option is YES', async () => {
    const claim = createClaimWithTotalAmount(YesNo.YES, SameRateInterestType.SAME_RATE_INTEREST_8_PC, 8, 'Reasons here....');
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 455);
    //Then
    expect(summarySections.sections[3].summaryList.rows.length).toBe(4);
    expect(summarySections.sections[3].title).toBe('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.TITLE');
    expect(summarySections.sections[3].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.CLAIM_AMOUNT');
    expect(summarySections.sections[3].summaryList.rows[0].value.html).toBe('£9,110');
    expect(summarySections.sections[3].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.INTEREST_TO_DATE');
    expect(summarySections.sections[3].summaryList.rows[1].value.html).toBe('£105.83');
    expect(summarySections.sections[3].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.CLAIM_FEE');
    expect(summarySections.sections[3].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.TOTAL');
    expect(summarySections.sections[3].summaryList.rows[3].value.html).toBe('£9,670.83');
  });

  it('should return your total claim amount sections and interest to date if claim interest option is NO', async () => {
    const claim = createClaimWithTotalAmount(YesNo.NO, undefined, undefined, '');
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 455);
    //Then
    expect(summarySections.sections[3].summaryList.rows.length).toBe(3);
    expect(summarySections.sections[3].title).toBe('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.TITLE');
    expect(summarySections.sections[3].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.CLAIM_AMOUNT');
    expect(summarySections.sections[3].summaryList.rows[0].value.html).toBe('£9,110');
    expect(summarySections.sections[3].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.CLAIM_FEE');
    expect(summarySections.sections[3].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TOTAL_AMOUNT.TOTAL');
    expect(summarySections.sections[3].summaryList.rows[2].value.html).toBe('£9,565');
  });
});
