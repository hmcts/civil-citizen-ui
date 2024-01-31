import {
  getSignatureType,
  getStatementOfTruth, getSummarySections,
  resetCheckboxFields,
  saveStatementOfTruth,
} from 'services/features/response/checkAnswers/checkAnswersService';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {SignatureType} from 'models/signatureType';
import {
  createClaimWithBasicRespondentDetails, createClaimWithFreeTelephoneMediationSection,
  createClaimWithMediationSectionWithOption,
  getClaimWithFewDetails,
} from '../../../../../utils/mockClaimForCheckAnswers';
import {Party} from 'models/party';
import {
  QualifiedStatementOfTruth,
} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';
import {PartyType} from 'models/partyType';
import {Claim} from 'models/claim';
import {CLAIM_ID} from '../../../../../utils/checkAnswersConstants';
import {getSummarySections as breathingSpace} from 'services/features/breathingSpace/checkYourAnswer/checkAnswersService';
import {YesNo} from 'form/models/yesNo';
import {buildMediationSection} from 'services/features/response/checkAnswers/responseSection/buildMediationSection';
import {
  buildFreeTelephoneMediationSection,
} from 'services/features/response/checkAnswers/responseSection/buildFreeTelephoneMediationSection';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;

const expectedStatementOfTruth = {
  isFullAmountRejected: false,
  type: 'basic',
};

describe('Check Answers service', () => {
  describe('Get Data from Draft', () => {
    it('should throw error when retrieving data from draft store fails', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      //Then
      await expect(
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthForm(false, SignatureType.BASIC, true))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
    it('should retrieve data from draft store', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.defendantStatementOfTruth = {isFullAmountRejected: false, type: SignatureType.BASIC, signed: true};
        return claim;
      });

      //Then
      await expect(
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthForm(false, SignatureType.BASIC, true))).toBeTruthy();
    });
  });

  describe('resetCheckboxFields', () => {
    it('should set directionsQuestionnaireSigned and signed to empty string for statement of truth', () => {
      const statementOfTruth = new StatementOfTruthForm(false);
      expect(resetCheckboxFields(statementOfTruth)).toEqual(expectedStatementOfTruth);
    });

    it('should set directionsQuestionnaireSigned and signed to empty string for qualified statement of truth', () => {
      const qualifiedStatementOfTruth = new QualifiedStatementOfTruth(false);
      const expectedQualifiedStatementOfTruth = {
        ...expectedStatementOfTruth,
        type: 'qualified',
      };
      expect(resetCheckboxFields(qualifiedStatementOfTruth)).toEqual(expectedQualifiedStatementOfTruth);
    });
  });

  describe('getStatementOfTruth', () => {
    let claim: Claim;

    beforeEach(() => {
      claim = createClaimWithBasicRespondentDetails();
    });

    it('should return statement of truth if it is set in the draft store', () => {
      claim.defendantStatementOfTruth = new StatementOfTruthForm(false);
      expect(getStatementOfTruth(claim)).toEqual(expectedStatementOfTruth);
    });

    it('should create new statement of truth if signature type is basic', () => {
      expect(getStatementOfTruth(claim)).toEqual({isFullAmountRejected: false, type: 'basic'});
    });

    it('should create new qualified statement of truth if signature type is qualified', () => {
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.ORGANISATION;
      expect(getStatementOfTruth(claim)).toEqual({isFullAmountRejected: false, type: 'qualified'});
    });
  });

  describe('getSignatureType', () => {
    let claim: Claim;

    beforeEach(() => {
      claim = createClaimWithBasicRespondentDetails();
    });

    it('should return basic signature type if respondent is individual', () => {
      expect(getSignatureType(claim)).toEqual(SignatureType.BASIC);
    });

    it('should return basic signature type if respondent is sole trader', () => {
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.SOLE_TRADER;
      expect(getSignatureType(claim)).toEqual(SignatureType.BASIC);
    });

    it('should return basic signature type if respondent is company', () => {
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.COMPANY;
      expect(getSignatureType(claim)).toEqual(SignatureType.QUALIFIED);
    });

    it('should return basic signature type if respondent is organisation', () => {
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.ORGANISATION;
      expect(getSignatureType(claim)).toEqual(SignatureType.QUALIFIED);
    });
  });

  describe('Obtain data summary from Draft', () => {
    it('should provide the data summary', async () => {
      //Given
      const claim = await getClaimWithFewDetails();
      const summarySections = breathingSpace(CLAIM_ID, claim.claimDetails.breathingSpace, 'en');
      //Then
      expect(summarySections.sections[0].summaryList.rows.length).toBe(4);
      expect(summarySections.sections[0].summaryList.rows[0].value.html).toBe('R225B1230');
      expect(summarySections.sections[0].summaryList.rows[1].value.html).toBe('10 January 2022');
      expect(summarySections.sections[0].summaryList.rows[2].value.html).toBe('PAGES.BREATHING_SPACE_DEBT_RESPITE_TYPE.STANDARD');
      expect(summarySections.sections[0].summaryList.rows[3].value.html).toBe('10 December 2022');
    });
  });

  describe('Obtain Mediation ', () => {
    it('should get meditation when carm is available ', async () => {
      //Given

      const claim = createClaimWithMediationSectionWithOption(YesNo.YES);
      const mediationSectionExpected = buildMediationSection(claim, CLAIM_ID, 'en');
      const summarySections = getSummarySections(CLAIM_ID, claim, 'en', true);
      //Then
      expect(summarySections.sections[0].summaryList.rows.length).toBe(6);
      expect(summarySections.sections[7]).toStrictEqual(mediationSectionExpected);
    });

    it('should get free telefone meditation when carm is not available ', async () => {
      //Given
      const claim = createClaimWithFreeTelephoneMediationSection();
      const mediationSectionExpected = buildFreeTelephoneMediationSection(claim, CLAIM_ID, 'en');
      const summarySections = getSummarySections(CLAIM_ID, claim, 'en', false);
      //Then
      expect(summarySections.sections[0].summaryList.rows.length).toBe(6);
      expect(summarySections.sections[7]).toStrictEqual(mediationSectionExpected);
    });
  });
});

