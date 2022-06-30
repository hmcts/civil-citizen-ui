import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  CITIZEN_AMOUNT_YOU_PAID_URL,
} from '../../../../../../../main/routes/urls';

import * as constVal from '../../../../../../utils/checkAnswersConstants';

import {HowMuchDoYouOwe} from '../../../../../../../main/common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {HowMuchHaveYouPaid, HowMuchHaveYouPaidParams} from '../../../../../../../main/common/form/models/admission/howMuchHaveYouPaid';
import {WhyDoYouDisagree} from '../../../../../../../main/common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {PartialAdmission} from '../../../../../../../main/common/models/partialAdmission';
import {AlreadyPaid} from '../../../../../../../main/common/form/models/admission/partialAdmission/alreadyPaid';
import {DefendantTimeline} from '../../../../../../../main/common/form/models/timeLineOfEvents/defendantTimeline';
import {PaymentIntention} from '../../../../../../../main/common/form/models/admission/partialAdmission/paymentIntention';
import {Claim} from '../../../../../../../main/common/models/claim';
import {ResponseType} from '../../../../../../../main/common/form/models/responseType';
import {CounterpartyType} from '../../../../../../../main/common/models/counterpartyType';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const PARTY_NAME = 'Nice organisation';
const CONTACT_NUMBER = '077777777779';

describe('Response Details', () => {
  it('should return your response details section', async () => {
    //Given
    const claim = ceateClaimWithPartialAdmission();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_AMOUNT_YOU_PAID_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].title).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_TITLE');
  });

  it('should return "How much did you pay?" on your response details section', async () => {
    //Given
    const claim = ceateClaimWithPartialAdmission();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_MONEY_PAID');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].value.html).toBe('£100');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items[0].href).toBe(CITIZEN_AMOUNT_YOU_PAID_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[0].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);

  });

  it('should return "When did you pay this amount?" on your response details section', async () => {
    //Given
    const claim = ceateClaimWithPartialAdmission();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[1].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[1].value.html).toBe('14 February 2022');
  });

  it('should return "How did you pay the amount claimed?" on your response details section', async () => {
    //Given
    const claim = ceateClaimWithPartialAdmission();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[2].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHEN_DID_YOU_PAY_AMOUT_CLAIMED');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[2].value.html).toBe('Test details');
  });

  it('should return "Why do you disagree with the amount claimed?" on your response details section', async () => {
    //Given
    const claim = ceateClaimWithPartialAdmission();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'cimode');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].key.text).toBe('PAGES.CHECK_YOUR_ANSWER.RESPONSE_DETAILS_WHY_DO_YOU_DISAGREE');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].value.html).toBe('Reasons for disagree');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].actions?.items[0].href).toBe(CITIZEN_AMOUNT_YOU_PAID_URL.replace(':id', constVal.CLAIM_ID));
    expect(summarySections.sections[constVal.INDEX_RESPONSE_DETAILS_SECTION].summaryList.rows[3].actions?.items[0].text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_CHANGE);
  });
});


const ceateClaimWithPartialAdmission = () => {
  const claim = new Claim();
  const param: HowMuchHaveYouPaidParams = {};
  param.amount = 100;
  param.totalClaimAmount = 200;
  param.day = '14';
  param.month = '2';
  param.year = '2022';
  param.text = 'Test details';

  const howMuchDoYouOwe: HowMuchDoYouOwe = new HowMuchDoYouOwe(100, 200);
  const whyDoYouDisagree: WhyDoYouDisagree = new WhyDoYouDisagree('Reasons for disagree');
  const howMuchHaveYouPaid: HowMuchHaveYouPaid = new HowMuchHaveYouPaid(param);

  const partialAdmission: PartialAdmission = {
    whyDoYouDisagree: whyDoYouDisagree,
    howMuchDoYouOwe: howMuchDoYouOwe,
    alreadyPaid: new AlreadyPaid(''),
    howMuchHaveYouPaid: howMuchHaveYouPaid,
    timeline: new DefendantTimeline(undefined, undefined),
    paymentIntention: new PaymentIntention(),
  };
  claim.respondent1 = {
    partyName: PARTY_NAME,
    telephoneNumber: CONTACT_NUMBER,
    contactPerson: '',
    dateOfBirth: new Date('2000-12-12'),
    responseType: ResponseType.PART_ADMISSION,
    type: CounterpartyType.INDIVIDUAL,
    primaryAddress: {
      AddressLine1: '23 Brook lane',
      PostTown: 'Bristol',
      PostCode: 'BS13SS',
    },
  };
  claim.partialAdmission = partialAdmission;
  return claim;
};

