import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  createClaimWithFreeTelephoneMediationSection,
  createClaimWithFreeTelephoneMediationSectionForIndividual,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {PartyType} from '../../../../../../../main/common/models/partyType';
import {YesNo} from '../../../../../../../main/common/form/models/yesNo';
import {CompanyTelephoneNumber} from '../../../../../../../main/common/form/models/mediation/companyTelephoneNumber';
import {Mediation} from 'models/mediation/mediation';
import {GenericYesNo} from 'form/models/genericYesNo';
import {NoMediationReason} from 'form/models/mediation/noMediationReason';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Free Telephone Mediation Section', () => {

  it('should return response free telephone mediation with free mediation and contact number', async () => {
    //When
    const claim = createClaimWithFreeTelephoneMediationSection();
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows.length).toBe(2);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].title).toBe(constVal.PAGES_FREE_TELEPHONE_MEDIATION_PAGE_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_MEDIATION);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].value.html).toBe(constVal.COMMON_VARIATION_2_YES);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_CONTACT_NUMBER);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[1].value.html).toBe('123456');

  });

  it('should return response free telephone mediation with free mediation with different number and phone', async () => {
    //Given
    const claim = createClaimWithFreeTelephoneMediationSection();
    if (claim.respondent1) {
      claim.respondent1.type = PartyType.COMPANY;
    }
    claim.mediation = new Mediation({option: YesNo.YES, mediationPhoneNumber: '123456'},
      new GenericYesNo(YesNo.YES),
      new NoMediationReason('notWant', 'no'),
      new CompanyTelephoneNumber(YesNo.NO, '123456', 'userTest', '123456'));

    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows.length).toBe(3);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].title).toBe(constVal.PAGES_FREE_TELEPHONE_MEDIATION_PAGE_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_MEDIATION);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].value.html).toBe(constVal.COMMON_VARIATION_2_YES);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_CONTACT_NAME);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[1].value.html).toBe('userTest');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_CONTACT_NUMBER);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[2].value.html).toBe('123456');
  });

  it('should return response free telephone mediation with free mediation and contact name and contact number', async () => {
    //Given
    const claim = createClaimWithFreeTelephoneMediationSection();
    if (claim.respondent1) {
      claim.respondent1.type = PartyType.COMPANY;
    }
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows.length).toBe(3);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].title).toBe(constVal.PAGES_FREE_TELEPHONE_MEDIATION_PAGE_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_MEDIATION);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].value.html).toBe(constVal.COMMON_VARIATION_2_YES);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_CONTACT_NAME);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[1].value.html).toBe('contactTest');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_CONTACT_NUMBER);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[2].value.html).toBe('123456');
  });

  it('should return response free telephone mediation with free mediation and contact name', async () => {
    //Given
    const claim = createClaimWithFreeTelephoneMediationSection();
    if (claim.mediation?.mediationDisagreement) {
      claim.mediation.mediationDisagreement.option = YesNo.NO;
    }
    if (claim.mediation?.canWeUse) {
      claim.mediation.canWeUse = undefined;
    }
    if (claim.respondent1) {
      claim.respondent1.type = PartyType.COMPANY;
    }
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].title).toBe(constVal.PAGES_FREE_TELEPHONE_MEDIATION_PAGE_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_MEDIATION);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].value.html).toBe(constVal.COMMON_VARIATION_2_NO);

  });

  it('should return response free telephone mediation with company telephone number', async () => {
    //Given
    const claim = createClaimWithFreeTelephoneMediationSection();
    if (claim?.mediation) {
      claim.mediation.canWeUse = undefined;
      claim.mediation.mediationDisagreement = undefined;
    }
    if (claim.respondent1) {
      claim.respondent1.type = PartyType.COMPANY;
    }
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows.length).toBe(3);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].title).toBe(constVal.PAGES_FREE_TELEPHONE_MEDIATION_PAGE_TITLE);

  });

  it('should return response free telephone mediation with free mediation and mediationPhoneNumber', async () => {
    //Given
    const claim = createClaimWithFreeTelephoneMediationSection();
    if (claim?.mediation) {
      claim.mediation.companyTelephoneNumber = new CompanyTelephoneNumber();
      claim.mediation.canWeUse = undefined;
    }

    if (claim.respondent1) {
      claim.respondent1.type = PartyType.COMPANY;
    }
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].title).toBe(constVal.PAGES_FREE_TELEPHONE_MEDIATION_PAGE_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_MEDIATION);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].value.html).toBe(constVal.COMMON_VARIATION_2_NO);

  });

  it('should return only the title', async () => {
    //When
    const claim = createClaimWithFreeTelephoneMediationSection();
    claim.mediation = undefined;
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION]).toBeNull();

  });

  it('should return response free telephone mediation with telephone number', async () => {
    //Given
    const claim = createClaimWithFreeTelephoneMediationSectionForIndividual();
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows.length).toBe(2);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].title).toBe(constVal.PAGES_FREE_TELEPHONE_MEDIATION_PAGE_TITLE);

  });
});
