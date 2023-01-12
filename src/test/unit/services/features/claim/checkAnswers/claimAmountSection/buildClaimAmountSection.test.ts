import {getSummarySections} from '../../../../../../../main/services/features/claim/checkAnswers/checkAnswersService';
import {
  CLAIM_INTEREST_FROM_URL,
  CLAIM_INTEREST_TYPE_URL,
  CLAIM_INTEREST_URL,
  CLAIMANT_INTEREST_RATE_URL,
} from '../../../../../../../main/routes/urls';
import {
  claimWithClaimAmountDifferentRate,
  claimWithClaimAmountParticularDate,
  claimWithClaimAmountSameRate,
  claimWithClaimAmountSubmitDate,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Citizen Claim amount Section', () => {
  const claim = claimWithClaimAmountParticularDate();
  it('should return claim amount summary sections', async () => {
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CLAIM_AMOUNT_BREAKDOWN');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].value.html).toBe('');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CLAIM_INTEREST');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].value.html).toBe('yes');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CLAIM_INTEREST_URL);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe('PAGES.INTEREST_CLAIM_OPTIONS.TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe('PAGES.INTEREST_CLAIM_OPTIONS.SAME_RATE_INTEREST');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].actions?.items[0].href).toBe(CLAIM_INTEREST_TYPE_URL);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe('PAGES.CLAIMANT_INTEREST_RATE.TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('10%');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].actions?.items[0].href).toBe(CLAIMANT_INTEREST_RATE_URL);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe('PAGES.CLAIMANT_INTEREST_RATE.REASON');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].value.html).toBe('Reason');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CLAIMANT_INTEREST_RATE_URL);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].value.html).toBe('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.FROM_A_SPECIFIC_DATE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].actions?.items[0].href).toBe(CLAIM_INTEREST_FROM_URL);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.DATE_INTEREST');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe('1 February 2011');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].actions?.items[0].href).toBe(CLAIM_INTEREST_FROM_URL);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.REASON');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].value.html).toBe('Reason');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe('PAGES.CLAIM_JOURNEY.INTEREST_END_DATE.TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('PAGES.CLAIM_JOURNEY.INTEREST_END_DATE.UNTIL_SETTLED_OR_JUDGEMENT_MADE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].actions?.items[0].href).toBe(CLAIM_INTEREST_FROM_URL);

  });

  it('should return claim amount from a particular date', async () => {
    //Given
    const claim = claimWithClaimAmountParticularDate();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CLAIM_AMOUNT_BREAKDOWN');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].value.html).toBe('');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CLAIM_INTEREST');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].value.html).toBe('yes');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe('PAGES.INTEREST_CLAIM_OPTIONS.TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe('PAGES.INTEREST_CLAIM_OPTIONS.SAME_RATE_INTEREST');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe('PAGES.CLAIMANT_INTEREST_RATE.TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('10%');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe('PAGES.CLAIMANT_INTEREST_RATE.REASON');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].value.html).toBe('Reason');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].value.html).toBe('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.FROM_A_SPECIFIC_DATE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.DATE_INTEREST');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe('1 February 2011');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.REASON');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].value.html).toBe('Reason');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe('PAGES.CLAIM_JOURNEY.INTEREST_END_DATE.TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('PAGES.CLAIM_JOURNEY.INTEREST_END_DATE.UNTIL_SETTLED_OR_JUDGEMENT_MADE');
  });
  it('should return claim amount from submit date', async () => {
    //Given
    const claim = claimWithClaimAmountSubmitDate();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CLAIM_AMOUNT_BREAKDOWN');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].value.html).toBe('');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CLAIM_INTEREST');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].value.html).toBe('yes');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe('PAGES.INTEREST_CLAIM_OPTIONS.TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe('PAGES.INTEREST_CLAIM_OPTIONS.SAME_RATE_INTEREST');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe('PAGES.CLAIMANT_INTEREST_RATE.TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('PAGES.CLAIMANT_INTEREST_RATE.SAME_RATE_INTEREST_8_PC');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].value.html).toBe('PAGES.CLAIM_JOURNEY.WHEN_CLAIM_INTEREST_FROM.FROM_CLAIM_SUBMIT_DATE');
  });
  it('should return claim amount with same rate', async () => {
    //Given
    const claim = claimWithClaimAmountSameRate();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CLAIM_AMOUNT_BREAKDOWN');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].value.html).toBe('');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe('PAGES.INTEREST_CLAIM_OPTIONS.TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].value.html).toBe('PAGES.INTEREST_CLAIM_OPTIONS.SAME_RATE_INTEREST');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe('PAGES.CLAIMANT_INTEREST_RATE.TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe('PAGES.CLAIMANT_INTEREST_RATE.SAME_RATE_INTEREST_8_PC');
  });
  it('should return claim amount with different rate', async () => {
    //Given
    const claim = claimWithClaimAmountDifferentRate();

    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CLAIM_AMOUNT_BREAKDOWN');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].value.html).toBe('');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CLAIMANT_INTEREST_RATE.TITLE');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].value.html).toBe('10%');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe('PAGES.CLAIMANT_INTEREST_RATE.REASON');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe('Reason');
  });
});
