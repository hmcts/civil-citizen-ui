import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  CITIZEN_DEPENDANTS_URL,
} from '../../../../../../../main/routes/urls';
import {
  createClaimWithDependants,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Dependants Details', () => {
  it('should return children title when it exists', async () => {
    //Given
    const claim = createClaimWithDependants(true,1,10,10,2);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_AND_SAVINGS_ACCOUNTS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DISABILITY_ARE_YOU_DISABLED);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHERE_DO_YOU_LIVE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_PARTNER_DO_YOU_LIVE_WITH_A);

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHILDREN);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_DEPENDANTS_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });

  it('should return children declaration to "yes" when it exists', async () => {
    //Given
    const claim = createClaimWithDependants(true,1,undefined,undefined,undefined);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CHILDREN_DO_YOU_HAVE_ANY_LIVE_WITH_YOU');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].value.html).toBe('Yes');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });

  it('should return children declaration to "no" when it exists', async () => {
    //Given
    const claim = createClaimWithDependants(false,1,undefined,undefined,undefined);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].value.html).toBe('No');
  });

  it('should return children under 11 when it exists', async () => {
    //Given
    const claim = createClaimWithDependants(true,1,undefined,undefined,undefined);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CHILDREN_UNDER_11');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe('1');
  });

  it('should return children between 11 and 15 when it exists', async () => {
    //Given
    const claim = createClaimWithDependants(true,1,10,undefined,undefined);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CHILDREN_BETWEEN_11_TO_15');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].value.html).toBe('10');
  });

  it('should return children between 16 and 19 when it exists', async () => {
    //Given
    const claim = createClaimWithDependants(true,1,10,10,undefined);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CHILDREN_BETWEEN_16_TO_19');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('10');
  });

  it('should return children in full-time education or training when it exists', async () => {
    //Given
    const claim = createClaimWithDependants(true,1,10,10,2);
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CHILDREN_AGED_16_19_FT_EDUCATION');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('2');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });

  // it('should return children in full-time education or training when it exists', async () => {
  //   //Given
  //   const claim = createClaimWithDependants(true,1,undefined,undefined,undefined);
  //   //When
  //   const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
  //   //Then
  //   expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CHILDREN_UNDER_11');
  //   expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe('1');
  // });
});
