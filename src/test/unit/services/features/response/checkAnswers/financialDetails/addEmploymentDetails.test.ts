import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_WHO_EMPLOYS_YOU_URL,
  CITIZEN_SELF_EMPLOYED_URL,
} from '../../../../../../../main/routes/urls';
import {
  createClaimWithEmplymentDetails,
  createClaimWithEmployedCategory,
  createClaimWithSelfEmployedAndTaxBehind,
  createClaimWithSelfEmployedNoTaxBehind,
  createClaimWithUnemplymentDetailsOne,
  createClaimWithUnemplymentDetailsTwo,
  createClaimWithUnemploymentCategoryRETIRED,
  createClaimWithUnemploymentCategoryOTHER,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Employed and Self-Employed Details', () => {
  it('should return employemt details when it exists', async () => {
    //Given
    const claim = createClaimWithEmplymentDetails();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');

    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_AND_SAVINGS_ACCOUNTS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DISABILITY_ARE_YOU_DISABLED);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHERE_DO_YOU_LIVE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_PARTNER_DO_YOU_LIVE_WITH_A);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHILDREN);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHILDREN_DO_YOU_HAVE_ANY_LIVE_WITH_YOU);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CARER_CREDIT_DO_YOU_CLAIM);

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_DETAILS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].actions?.items[0].href).toBe(CITIZEN_EMPLOYMENT_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_DO_YOU_HAVE_A_JOB);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('COMMON.YES');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.EMPLOYED_AND_SELF_EMPLOYED');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[10].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_WHO_EMPLOYS_YOU);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[10].actions?.items[0].href).toBe(CITIZEN_WHO_EMPLOYS_YOU_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[11].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_NAME);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[11].value.html).toBe('Version 1');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[12].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[12].value.html).toBe('FE Developer');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[13].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_NAME);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[13].value.html).toBe('Version 1');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[14].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[14].value.html).toBe('BE Developer');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[15].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_DETAILS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[15].actions?.items[0].href).toBe(CITIZEN_SELF_EMPLOYED_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[16].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[16].value.html).toBe('Developer');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[17].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_ANNUAL_TURNOVER);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[17].value.html).toBe('£50,000');
  });

  it('should return employemt with "Employed" category selected when it exists', async () => {
    //Given
    const claim = createClaimWithEmployedCategory();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('PAGES.EMPLOYMENT_STATUS.EMPLOYED');
  });

  it('should return employemt with "Self-Employed" category selected and tax payments behind when it exists', async () => {
    //Given
    const claim = createClaimWithSelfEmployedAndTaxBehind();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('PAGES.EMPLOYMENT_STATUS.SELF_EMPLOYED');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[10].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_DETAILS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[10].actions?.items[0].href).toBe(CITIZEN_SELF_EMPLOYED_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[11].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[11].value.html).toBe('Developer');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[12].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_ANNUAL_TURNOVER);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[12].value.html).toBe('£50,000');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[13].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_TAX_PAYMENT_ARE_YOU_BEHIND);

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[14].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_TAX_PAYMENT_AMOUNT_YOU_OWE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[14].value.html).toBe('£200');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[15].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_TAX_PAYMENT_REASON);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[15].value.html).toBe('Tax payment reasons');
  });

  it('should return employemt with "Self-Employed" category selected and no tax payments behind when it exists', async () => {
    //Given
    const claim = createClaimWithSelfEmployedNoTaxBehind();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('PAGES.EMPLOYMENT_STATUS.SELF_EMPLOYED');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[10].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_DETAILS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[10].actions?.items[0].href).toBe(CITIZEN_SELF_EMPLOYED_URL.replace(':id', constVal.CLAIM_ID));

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[11].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[11].value.html).toBe('Developer');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[12].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_ANNUAL_TURNOVER);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[12].value.html).toBe('£50,000');

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[13].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_TAX_PAYMENT_ARE_YOU_BEHIND);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[13].value.html).toBe('COMMON.NO');
  });
});

describe('Unemployemt Details', () => {
  it('should return unemployment details with signle year/month when it exists', async () => {
    //Given
    const claim = createClaimWithUnemplymentDetailsOne();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_AND_SAVINGS_ACCOUNTS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DISABILITY_ARE_YOU_DISABLED);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHERE_DO_YOU_LIVE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_PARTNER_DO_YOU_LIVE_WITH_A);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHILDREN);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHILDREN_DO_YOU_HAVE_ANY_LIVE_WITH_YOU);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CARER_CREDIT_DO_YOU_CLAIM);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_DETAILS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_DO_YOU_HAVE_A_JOB);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.UNEMPLOYMENT_FOR');

  });

  it('should return unemployment details with multiple years/months when it exists', async () => {
    //Given
    const claim = createClaimWithUnemplymentDetailsTwo();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.UNEMPLOYMENT_FOR');
  });

  it('should return unemployment details with unemployment category equal to "Retired" when it exists', async () => {
    //Given
    const claim = createClaimWithUnemploymentCategoryRETIRED();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('Retired');
  });

  it('should return unemployment details with unemployment category equal to "Other" when it exists', async () => {
    //Given
    const claim = createClaimWithUnemploymentCategoryOTHER();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('Other details here');
  });
});
