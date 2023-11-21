import {getSummarySections} from '../../../../../../../main/services/features/claim/checkAnswers/checkAnswersService';
import {
  CLAIM_DEFENDANT_EMAIL_URL,
  CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL,
  CLAIM_DEFENDANT_PHONE_NUMBER_URL,
  DOB_URL,
} from '../../../../../../../main/routes/urls';
import {
  createClaimWithBasicRespondentDetails,
  createClaimWithContactPersonDetails,
  createClaimWithIndividualDetails,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import {PartyType} from '../../../../../../../main/common/models/partyType';
import {formatDateToFullDate} from '../../../../../../../main/common/utils/dateUtils';
import {PartyDetailsCARM} from 'form/models/partyDetails-CARM';
import {Email} from '../../../../../../../main/common/models/Email';
import {CitizenDate} from '../../../../../../../main/common/form/models/claim/claimant/citizenDate';

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
const EMAIL_ADDRESS = 'contact@gmail.com';
const CONTACT_NUMBER = '077777777779';
const ADDRESS = '23 Brook lane<br>Bristol<br>BS13SS';
const DOB = '12 December 2000';
const CLAIM_ID = 'claimId';
const INDEX_THEIRDETAILS_SECTION = 1;

describe('Citizen Details Section', () => {
  const claim = createClaimWithBasicRespondentDetails();
  it('should return your Individual details summary sections', async () => {
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.THEIR_DETAILS_TITLE_DEFENDANT');
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows.length).toBe(6);
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[0].value.html).toBe(FULL_NAME);
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL);
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.FULL_NAME');
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[1].value.html).toBe(ADDRESS);
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[1].actions?.items.length).toBe(1);
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[1].actions?.items[0].href).toBe(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL);
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[2].value.html).toBe('PAGES.CHECK_YOUR_ANSWER.SAME_ADDRESS');
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[2].actions?.items[0].href).toBe(CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL);
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[3].value.html).toBe(DOB);
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[3].actions?.items[0].href).toBe(DOB_URL.replace(':id', CLAIM_ID));
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[4].value.html).toBe(EMAIL_ADDRESS);
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[4].actions?.items[0].href).toBe(CLAIM_DEFENDANT_EMAIL_URL);
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[4].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EMAIL');
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[5].value.html).toBe(CONTACT_NUMBER);
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[5].actions?.items[0].href).toBe(CLAIM_DEFENDANT_PHONE_NUMBER_URL);
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[5].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.CONTACT_NUMBER');
  });

  it('should return full name of a person when full name is present', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[0].value.html).toBe(FULL_NAME);
  });
  it('should return contact person when contact person is specified', async () => {
    //Given
    const claim = createClaimWithContactPersonDetails();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[1].value.html).toBe(CONTACT_PERSON);
  });
  it('should return correspondence address when it exists', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[2].value.html).toBe(CORRESPONDENCE_ADDRESS);
  });
  it('should return email and date of birth when it exists', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    if (claim.respondent1) {
      claim.respondent1.emailAddress = new Email(EMAIL_ADDRESS);
      claim.respondent1.dateOfBirth = new CitizenDate('1', '2', '2000');
    }
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[3].value.html).toBe(formatDateToFullDate(new Date(2000, 1, 1)));
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[4].value.html).toBe(EMAIL_ADDRESS);
  });
  it('should return your Company details summary sections', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    if (claim.respondent1) {
      claim.respondent1.type = PartyType.SOLE_TRADER;
      claim.respondent1.partyDetails = new PartyDetailsCARM({});
      claim.respondent1.partyDetails.soleTraderTradingAs = 'Business name';
    }
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[1].value.html).toBe('Business name');
  });
  it('should return your Company details summary sections', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    if (claim.respondent1) {
      claim.respondent1.type = PartyType.COMPANY;
      claim.respondent1.partyDetails.contactPerson = CONTACT_PERSON;
    }
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[0].value.html).toBe('Nice organisation');
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[1].value.html).toBe('The Post Man');
  });
  it('should return your Organisation details summary sections', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    if (claim.respondent1) {
      claim.respondent1.type = PartyType.ORGANISATION;
    }
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[INDEX_THEIRDETAILS_SECTION].summaryList.rows[0].value.html).toBe('Nice organisation');
  });
});
