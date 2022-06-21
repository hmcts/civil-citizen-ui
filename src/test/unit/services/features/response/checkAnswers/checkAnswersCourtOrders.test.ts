import {
  getSummarySections,
} from '../../../../../../main/services/features/response/checkAnswersService';
import {
  CITIZEN_COURT_ORDERS_URL,
} from '../../../../../../main/routes/urls';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {
  createClaimWithCourtOrders,
  createClaimWithNoCourtOrders,
} from '../../../../../utils/mockClaimForCheckAnswers';
import {CLAIM_ID,INDEX_FINANCIAL_SECTION} from './constants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_CLAIM_NUMBER = 'PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_CLAIM_NUMBER';
const PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_AMOUNT_OWNED = 'PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_AMOUNT_OWNED';
const PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_MONTHLY_INSTALMENT = 'PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_MONTHLY_INSTALMENT';


describe('Court Orders Details', () => {
  it('should return court orders when it exists', async () => {
    //Given
    const claim = createClaimWithCourtOrders();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');

    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_TITLE');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].value.html).toBe(YesNo.YES.charAt(0).toUpperCase() + YesNo.YES.slice(1));
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_COURT_ORDERS_URL.replace(':id', CLAIM_ID));
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[5].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_CLAIM_NUMBER);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[5].value.html).toBe('1');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[6].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_AMOUNT_OWNED);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[6].value.html).toBe('£100');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[7].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_MONTHLY_INSTALMENT);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[7].value.html).toBe('£1,500');

    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[8].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_CLAIM_NUMBER);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[8].value.html).toBe('2');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[9].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_AMOUNT_OWNED);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[9].value.html).toBe('£250');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[10].key.text).toBe(PAGES_CHECK_YOUR_ANSWER_COURT_ORDERS_MONTHLY_INSTALMENT);
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[10].value.html).toBe('£2,500');

  });

  it('should display "No" when court orders checkbox is set to no', async () => {
    //Given
    const claim = createClaimWithNoCourtOrders();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'eng');

    //Then
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.COURT_ORDERS_TITLE');
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].value.html).toBe(YesNo.NO.charAt(0).toUpperCase() + YesNo.NO.slice(1));
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_COURT_ORDERS_URL.replace(':id', CLAIM_ID));
    expect(summarySections.sections[INDEX_FINANCIAL_SECTION].summaryList.rows[4].actions?.items[0].text).toBe('PAGES.CHECK_YOUR_ANSWER.CHANGE');
  });
});
