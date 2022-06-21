import {
  getSummarySections,
} from '../../../../../../main/services/features/response/checkAnswersService';
import {
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_WHO_EMPLOYS_YOU_URL,
  CITIZEN_SELF_EMPLOYED_URL,
} from '../../../../../../main/routes/urls';

import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {
  createClaimWithEmplymentDetails,
  createClaimWithEmployedCategory,
  createClaimWithSelfEmployedAndTaxBehind,
  createClaimWithSelfEmployedNoTaxBehind,
} from '../../../../../utils/mockClaimForCheckAnswers';
import {CLAIM_ID,INDEX_FINANCIAL_SECTION} from './constants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE = 'PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_TYPE';
const PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_NAME = 'PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_NAME';
const PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE = 'PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_JOB_TITLE';
const PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_DETAILS = 'PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_SELF_DETAILS';
const PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_ANNUAL_TURNOVER = 'PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_SELF_ANNUAL_TURNOVER';
const PAGES_CHECK_YOUR_ANSWER_TAX_PAYMENT_ARE_YOU_BEHIND = 'PAGES.CHECK_YOUR_ANSWER.TAX_PAYMENT_ARE_YOU_BEHIND';

describe('Employed and Self-Employed Details', () => {
  it('should return employemt details when it exists', async () => {
    //Given
    const claim = createClaimWithEmplymentDetails();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_DETAILS');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_EMPLOYMENT_URL.replace(':id', CLAIM_ID));
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[1].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_DO_YOU_HAVE_A_JOB');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('Employed and Self-employed');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EMPLOYMENT_WHO_EMPLOYS_YOU');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_WHO_EMPLOYS_YOU_URL.replace(':id', CLAIM_ID));

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_NAME);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[5].value.html).toBe('Version 1');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe('FE Developer');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_NAME);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[7].value.html).toBe('Version 1');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('BE Developer');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_DETAILS);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[9].actions?.items[0].href).toBe(CITIZEN_SELF_EMPLOYED_URL.replace(':id', CLAIM_ID));

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[10].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[10].value.html).toBe('Developer');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[11].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_ANNUAL_TURNOVER);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[11].value.html).toBe('£50,000');
  });

  it('should return employemt with "Employed" category selected when it exists', async () => {
    //Given
    const claim = createClaimWithEmployedCategory();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('Employed');
  });

  it('should return employemt with "Self-Employed" category selected and tax payments behind when it exists', async () => {
    //Given
    const claim = createClaimWithSelfEmployedAndTaxBehind();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('Self-employed');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_DETAILS);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_SELF_EMPLOYED_URL.replace(':id', CLAIM_ID));

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[5].value.html).toBe('Developer');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_ANNUAL_TURNOVER);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe('£50,000');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_TAX_PAYMENT_ARE_YOU_BEHIND);

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TAX_PAYMENT_AMOUNT_YOU_OWE');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('£200');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.TAX_PAYMENT_REASON');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('Tax payment reasons');
  });

  it('should return employemt with "Self-Employed" category selected and no tax payments behind when it exists', async () => {
    //Given
    const claim = createClaimWithSelfEmployedNoTaxBehind();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');
    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_TYPE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[3].value.html).toBe('Self-employed');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_DETAILS);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_SELF_EMPLOYED_URL.replace(':id', CLAIM_ID));

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_JOB_TITLE);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[5].value.html).toBe('Developer');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_EMPLOYMENT_SELF_ANNUAL_TURNOVER);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe('£50,000');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_TAX_PAYMENT_ARE_YOU_BEHIND);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[7].value.html).toBe('No');
  });
});
