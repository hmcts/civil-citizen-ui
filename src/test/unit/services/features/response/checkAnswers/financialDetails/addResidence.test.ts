import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  CITIZEN_RESIDENCE_URL,
} from '../../../../../../../main/routes/urls';
import {
  createClaimWithResidence,
  createClaimWithResidenceOther,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Residence Details', () => {
  it('should return residence with COUNCIL_OR_HOUSING_ASSN_HOME value when it exists', async () => {
    //Given
    const claim = createClaimWithResidence('COUNCIL_OR_HOUSING_ASSN_HOME','Council or housing association home');
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_BANK_AND_SAVINGS_ACCOUNTS);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_DISABILITY_ARE_YOU_DISABLED);

    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHERE_DO_YOU_LIVE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].actions?.items[0].href).toBe(CITIZEN_RESIDENCE_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe('Council or housing association home');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });

  it('should return residence with PRIVATE_RENTAL value when it exists', async () => {
    //Given
    const claim = createClaimWithResidence('PRIVATE_RENTAL','Private rental');
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHERE_DO_YOU_LIVE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].actions?.items[0].href).toBe(CITIZEN_RESIDENCE_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe('Private rental');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });

  it('should return residence with JOINT_OWN_HOME value when it exists', async () => {
    //Given
    const claim = createClaimWithResidence('JOINT_OWN_HOME','Jointly-owned home (or jointly mortgaged home)');
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHERE_DO_YOU_LIVE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].actions?.items[0].href).toBe(CITIZEN_RESIDENCE_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe('Jointly-owned home (or jointly mortgaged home)');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });

  it('should return residence with OWN_HOME value when it exists', async () => {
    //Given
    const claim = createClaimWithResidence('OWN_HOME','Home you own yourself (or pay a mortgage on)');
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHERE_DO_YOU_LIVE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].actions?.items[0].href).toBe(CITIZEN_RESIDENCE_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe('Home you own yourself (or pay a mortgage on)');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });

  it('should return other residence when it exists', async () => {
    //Given
    const claim = createClaimWithResidenceOther();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_WHERE_DO_YOU_LIVE);
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].actions?.items[0].href).toBe(CITIZEN_RESIDENCE_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].value.html).toBe('Flat');
    expect(summarySections.sections[constVal.INDEX_FINANCIAL_SECTION].summaryList.rows[2].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });
});
