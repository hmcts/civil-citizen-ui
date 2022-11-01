import {getSummarySections} from '../../../../../../../main/services/features/claim/checkAnswers/checkAnswersService';
import {CLAIM_AMOUNT_URL} from '../../../../../../../main/routes/urls';
import {
  claimWithClaimAmountBreakDown,
  claimWithClaimAmountOneBreakDown,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {Claim} from '../../../../../../../main/common/models/claim';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Claim amount Details', () => {
  it('should return claim amount breakdown', async () => {
    //Given
    const claim = claimWithClaimAmountBreakDown();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows.length).toBe(4);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CLAIM_AMOUNT_URL);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].title).toBe('COMMON.CLAIM_AMOUNT');
  });

  it('should return Claim amount with one breakdown', async () => {
    //Given
    const claim = claimWithClaimAmountOneBreakDown();

    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows.length).toBe(2);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CLAIM_AMOUNT_URL);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].title).toBe('COMMON.CLAIM_AMOUNT');
  });

  it('should return Claim amount without breakdown', async () => {
    //Given
    const claim = new Claim();

    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CLAIM_AMOUNT_URL);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].title).toBe('COMMON.CLAIM_AMOUNT');
  });

});
