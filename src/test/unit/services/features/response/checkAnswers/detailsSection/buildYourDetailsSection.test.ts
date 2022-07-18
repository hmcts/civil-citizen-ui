import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  CITIZEN_DETAILS_URL,
  CITIZEN_PHONE_NUMBER_URL,
  DOB_URL,
} from '../../../../../../../main/routes/urls';
import {
  createClaimWithBasicRespondentDetails,
  createClaimWithIndividualDetails,
  createClaimWithContactPersonDetails,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const CONTACT_PERSON = 'The Post Man';
const TITLE = 'Mr';
const FIRST_NAME = 'John';
const LAST_NAME = 'Richards';
const FULL_NAME = `${TITLE} ${FIRST_NAME} ${LAST_NAME}`;
const CORRESPONDENCE_ADDRESS = '24 Brook lane<br>Bristol<br>BS13SS';
const PARTY_NAME = 'Nice organisation';
const CONTACT_NUMBER = '077777777779';
const ADDRESS = '23 Brook lane<br>Bristol<br>BS13SS';
const DOB = '12 December 2000';

describe('Cirizen Details Section', () => {
  const claim = createClaimWithBasicRespondentDetails();
  it('should return your details summary sections', async () => {
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows.length).toBe(5);
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[0].value.html).toBe(PARTY_NAME);
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_DETAILS_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[1].value.html).toBe(ADDRESS);
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[1].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CITIZEN_DETAILS_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[2].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS');
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[2].actions?.items[0].href).toBe(CITIZEN_DETAILS_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[4].value.html).toBe(CONTACT_NUMBER);
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CITIZEN_PHONE_NUMBER_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[3].value.html).toBe(DOB);
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[3].actions?.items[0].href).toBe(DOB_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE');
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.FULL_NAME');
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER');
  });

  it('should return full name of a person when full name is present', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[0].value.html).toBe(FULL_NAME);
  });
  it('should return contact person when contact person is specified', async () => {
    //Given
    const claim = createClaimWithContactPersonDetails();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[1].value.html).toBe(CONTACT_PERSON);
  });
  it('should return correspondence address when it exists', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_DETAILS_SECTION].summaryList.rows[2].value.html).toBe(CORRESPONDENCE_ADDRESS);
  });
});
