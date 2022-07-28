import {
  getSummarySections,
} from '../../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import {
  createClaimWithFreeTelephoneMediationSection,
  createClaimWithNoTelephoneMediationProvided,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';
import {CounterpartyType} from '../../../../../../../main/common/models/counterpartyType';
import {YesNo} from '../../../../../../../main/common/form/models/yesNo';
import {CompanyTelephoneNumber} from '../../../../../../../main/common/form/models/mediation/companyTelephoneNumber';
import {SummarySections} from '../../../../../../../main/common/models/summaryList/summarySections';

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
    const claim = createClaimWithFreeTelephoneMediationSection(CounterpartyType.INDIVIDUAL);
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows.length).toBe(2);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].title).toBe(constVal.PAGES_FREE_TELEPHONE_MEDIATION_PAGE_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_MEDIATION);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].value.html).toBe(constVal.COMMON_YES);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_CONTACT_NUMBER);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[1].value.html).toBe('123456');

  });
  it('should return response free telephone mediation with free mediation and contact name and contact number', async () => {
    //Given
    const claim = createClaimWithFreeTelephoneMediationSection(CounterpartyType.INDIVIDUAL);
    if (claim.respondent1) {
      claim.respondent1.type = CounterpartyType.COMPANY;
    }
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows.length).toBe(3);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].title).toBe(constVal.PAGES_FREE_TELEPHONE_MEDIATION_PAGE_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_MEDIATION);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].value.html).toBe(constVal.COMMON_YES);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_CONTACT_NAME);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[1].value.html).toBe('userTest');
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_CONTACT_NUMBER);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[2].value.html).toBe('123456');
  });
  it('should return response free telephone mediation with free mediation and contact name', async () => {
    //Given
    const claim = createClaimWithFreeTelephoneMediationSection(CounterpartyType.INDIVIDUAL);
    if (claim.mediation?.mediationDisagreement) {
      claim.mediation.mediationDisagreement.option = YesNo.NO;
    }
    if (claim.mediation?.canWeUse) {
      claim.mediation.canWeUse = undefined;
    }
    if (claim.respondent1) {
      claim.respondent1.type = CounterpartyType.COMPANY;
    }
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].title).toBe(constVal.PAGES_FREE_TELEPHONE_MEDIATION_PAGE_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_MEDIATION);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].value.html).toBe(constVal.COMMON_NO);

  });

  it('should return response free telephone mediation with company telephone number', async () => {
    //Given
    const claim = createClaimWithFreeTelephoneMediationSection(CounterpartyType.INDIVIDUAL);
    if (claim?.mediation) {
      claim.mediation.canWeUse = undefined;
      claim.mediation.mediationDisagreement = undefined;
    }
    if (claim.respondent1) {
      claim.respondent1.type = CounterpartyType.COMPANY;
    }
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows.length).toBe(3);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].title).toBe(constVal.PAGES_FREE_TELEPHONE_MEDIATION_PAGE_TITLE);

  });

  it('should return response free telephone mediation with free mediation and mediationPhoneNumber', async () => {
    //Given
    const claim = createClaimWithFreeTelephoneMediationSection(CounterpartyType.INDIVIDUAL);
    if (claim?.mediation) {
      claim.mediation.companyTelephoneNumber = new CompanyTelephoneNumber();
      claim.mediation.canWeUse = undefined;
    }

    if (claim.respondent1) {
      claim.respondent1.type = CounterpartyType.COMPANY;
    }
    //When
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows.length).toBe(1);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].title).toBe(constVal.PAGES_FREE_TELEPHONE_MEDIATION_PAGE_TITLE);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_MEDIATION);
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].value.html).toBe(constVal.COMMON_NO);

  });

  it('should return only the title', async () => {
    //When
    const claim = createClaimWithFreeTelephoneMediationSection(CounterpartyType.INDIVIDUAL);
    claim.mediation = undefined;
    const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
    //Then
    expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows.length).toBe(1);

  });

  describe('Free Telephone Mediation Section - INDIVIDUAL/SOLE_TRADER/COMPANY/ORGANISATION', () => {

    const getExpectedResultForCompanyAndOrganisation = (summarySections: SummarySections, contactName: string, contactNumber: string) => {
      expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows.length).toBe(3);
      expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].title).toBe(constVal.PAGES_FREE_TELEPHONE_MEDIATION_PAGE_TITLE);
      expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_MEDIATION);
      expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].value.html).toBe(constVal.COMMON_YES);
      expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_CONTACT_NAME);
      expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[1].value.html).toBe(contactName);
      expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[2].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_CONTACT_NUMBER);
      expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[2].value.html).toBe(contactNumber);
    };

    const getExpectedResultForIndividualAndSoleTrader = (summarySections: SummarySections, contactNumber: string) => {
      expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].title).toBe(constVal.PAGES_FREE_TELEPHONE_MEDIATION_PAGE_TITLE);
      expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_MEDIATION);
      expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[0].value.html).toBe(constVal.COMMON_YES);
      expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[1].key.text).toBe(constVal.PAGES_CHECK_YOUR_ANSWER_FREE_TELEPHONE_CONTACT_NUMBER);
      expect(summarySections.sections[constVal.INDEX_RESPONSE_FREE_TELEPHONE_MEDIATION_SECTION].summaryList.rows[1].value.html).toBe(contactNumber);
    };

    it('should return response free telephone mediation with free mediation and contact name and number when counter part type is COMPANY', async () => {
      //Given
      const claim = createClaimWithFreeTelephoneMediationSection(CounterpartyType.COMPANY);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
      //Then
      getExpectedResultForCompanyAndOrganisation(summarySections,'userTest','123456');
    });

    it('should return response free telephone mediation with free mediation and contact name and number when counter part type is ORGANISATION', async () => {
      //Given
      const claim = createClaimWithFreeTelephoneMediationSection(CounterpartyType.ORGANISATION);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
      //Then
      getExpectedResultForCompanyAndOrganisation(summarySections,'userTest','123456');
    });

    it('should return response free telephone mediation with free mediation and contact name and number when counter part type is INDIVIDUAL', async () => {
      //Given
      const claim = createClaimWithFreeTelephoneMediationSection(CounterpartyType.INDIVIDUAL);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
      //Then
      getExpectedResultForIndividualAndSoleTrader(summarySections,'123456');
    });

    it('should return response free telephone mediation with free mediation and contact name and number when counter part type is SOLE_TRADER', async () => {
      //Given
      const claim = createClaimWithFreeTelephoneMediationSection(CounterpartyType.SOLE_TRADER);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
      //Then
      getExpectedResultForIndividualAndSoleTrader(summarySections,'123456');
    });

    it('should return response free telephone mediation with no free mediation and contact name and number when counter part type is COMPANY', async () => {
      //Given
      const claim = createClaimWithNoTelephoneMediationProvided(CounterpartyType.COMPANY);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
      //Then
      getExpectedResultForCompanyAndOrganisation(summarySections,'contactTest','077777777779');
    });

    it('should return response free telephone mediation with no free mediation and contact name and number when counter part type is ORGANISATION', async () => {
      //Given
      const claim = createClaimWithNoTelephoneMediationProvided(CounterpartyType.ORGANISATION);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
      //Then
      getExpectedResultForCompanyAndOrganisation(summarySections,'contactTest','077777777779');
    });

    it('should return response free telephone mediation with no free mediation and contact name and number when counter part type is INDIVIDUAL', async () => {
      //Given
      const claim = createClaimWithNoTelephoneMediationProvided(CounterpartyType.INDIVIDUAL);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
      //Then
      getExpectedResultForIndividualAndSoleTrader(summarySections,'077777777779');
    });

    it('should return response free telephone mediation with no free mediation and contact name and number when counter part type is SOLE_TRADER', async () => {
      //Given
      const claim = createClaimWithNoTelephoneMediationProvided(CounterpartyType.SOLE_TRADER);
      //When
      const summarySections = await getSummarySections(constVal.CLAIM_ID, claim, 'en');
      //Then
      getExpectedResultForIndividualAndSoleTrader(summarySections,'077777777779');
    });
  });
});
