import {
  createClaimWithBasicRespondentDetails,
  createClaimWithIndividualDetails,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import {Email} from 'models/Email';
import {getSummarySections} from 'services/features/claimantResponse/ccj/ccjCheckAnswersService';
import {ClaimantResponse} from 'models/claimantResponse';
import {CCJRequest} from 'models/claimantResponse/ccj/ccjRequest';
import {YesNo} from 'form/models/yesNo';
import {formatDateToFullDate} from 'common/utils/dateUtils';

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
const CLAIM_ID = 'claimId';


describe('Citizen Details Section', () => {
  const claim = createClaimWithBasicRespondentDetails();
  it('should return your Individual details summary sections', async () => {
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[0].title).toBe('PAGES.CHECK_YOUR_ANSWER.THEIR_DETAILS_TITLE_DEFENDANT');
    expect(summarySections.sections[0].summaryList.rows.length).toBe(3);
    expect(summarySections.sections[0].summaryList.rows[0].value.html).toBe(FULL_NAME);
    expect(summarySections.sections[0].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.FULL_NAME');
    expect(summarySections.sections[0].summaryList.rows[1].value.html).toBe(ADDRESS);
    expect(summarySections.sections[0].summaryList.rows[2].value.html).toBe(EMAIL_ADDRESS);
    expect(summarySections.sections[0].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.EMAIL');
  });

  it('should return address when it exists', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    const address = '24 Brook lane<br>Bristol<br>BS13SS';
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[0].summaryList.rows[1].value.html).toBe(address);
  });

  it('should return full name of a person when full name is present', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[0].summaryList.rows[0].value.html).toBe(FULL_NAME);
  });

  it('should return date of birth of a person when date of birth present', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    const dob = new Date('2000-11-11T00:00:00.000Z');
    claim.claimantResponse = new ClaimantResponse();
    claim.claimantResponse.ccjRequest = new CCJRequest();
    claim.claimantResponse.ccjRequest.defendantDOB = {
      option: YesNo.YES,
      dob: {dateOfBirth: dob},
    };
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[0].summaryList.rows[2].value.html).toBe(formatDateToFullDate(dob));
  });

  it('should return email when it exists', async () => {
    //Given
    const claim = createClaimWithIndividualDetails();
    if (claim.respondent1) {
      claim.respondent1.emailAddress = new Email(EMAIL_ADDRESS);
    }
    //When
    const summarySections = await getSummarySections(CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[0].summaryList.rows[2].value.html).toBe(EMAIL_ADDRESS);
  });
});
