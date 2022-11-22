import {
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_PHONE_NUMBER_URL,
} from '../../../../../../../main/routes/urls';
import {
  createClaimWithBasicRespondentDetails,
  createClaimWithIndividualDetails,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {Email} from '../../../../../../../main/common/models/Email';
import {getSummarySections} from 'services/features/claimantResponse/ccj/ccjCheckAnswersService';

jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const TITLE = 'Mr';
const FIRST_NAME = 'John';
const LAST_NAME = 'Richards';
const FULL_NAME = `${TITLE} ${FIRST_NAME} ${LAST_NAME}`;
const EMAIL_ADDRESS = 'contact@gmail.com';
const ADDRESS = '23 Brook lane<br>Bristol<br>BS13SS';

describe('Citizen Details Section', () => {
  const claim = createClaimWithBasicRespondentDetails();
  it('should return your Individual details summary sections', async () => {
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.THEIR_DETAILS_TITLE_DEFENDANT');
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows.length).toBe(5);
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows[0].value.html).toBe(FULL_NAME);
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL);
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.FULL_NAME');
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows[1].value.html).toBe(ADDRESS);
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows[1].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL);
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows[2].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS');
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows[2].actions?.items[0].href).toBe(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL);
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CLAIM_DEFENDANT_PHONE_NUMBER_URL);
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER');
  });
  it('should return address when it exists', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows[2].value.html).toBe(ADDRESS);
  });
  it('should return full name of a person when full name is present', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows[0].value.html).toBe(FULL_NAME);
  });
  it('should return email when it exists', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    if (claim.respondent1) {
      claim.respondent1.emailAddress = new Email(EMAIL_ADDRESS);
    }
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_THEIRDETAILS_SECTION].summaryList.rows[4].value.html).toBe(EMAIL_ADDRESS);
  });
});
