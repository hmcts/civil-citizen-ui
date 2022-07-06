import {
  getSignatureType,
  getStatementOfTruth,
  //getSummarySections,
  resetCheckboxFields,
  saveStatementOfTruth,
} from '../../../../../../main/services/features/response/checkAnswers/checkAnswersService';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../../../../src/test/utils/errorMessageTestConstants';
import {StatementOfTruthForm} from '../../../../../../main/common/form/models/statementOfTruth/statementOfTruthForm';
import {SignatureType} from '../../../../../../main/common/models/signatureType';
import {
  createClaimWithBasicRespondentDetails,
  // createClaimWithIndividualDetails,
  // createClaimWithContactPersonDetails,
} from '../../../../../utils/mockClaimForCheckAnswers';
import {Respondent} from '../../../../../../main/common/models/respondent';
import {QualifiedStatementOfTruth} from '../../../../../../main/common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {CounterpartyType} from '../../../../../../main/common/models/counterpartyType';
import {Claim} from '../../../../../../main/common/models/claim';
import {
  CLAIM_ID,
} from '../../../../../utils/checkAnswersConstants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
// const CONTACT_PERSON = 'The Post Man';
// const TITLE = 'Mr';
// const FIRST_NAME = 'John';
// const LAST_NAME = 'Richards';
// const FULL_NAME = `${TITLE} ${FIRST_NAME} ${LAST_NAME}`;
// const CORRESPONDENCE_ADDRESS = '24 Brook lane<br>Bristol<br>BS13SS';
const expectedStatementOfTruth = {
  isFullAmountRejected: false,
  type: 'basic',
  directionsQuestionnaireSigned: '',
  signed: '',
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
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthForm(false, SignatureType.BASIC, 'true'))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
    it('should retrieve data from draft store', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        const claim = new Claim();
        claim.defendantStatementOfTruth = { isFullAmountRejected: false, type: SignatureType.BASIC, signed: 'true' };
        return claim;
      });

      //Then
      await expect(
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthForm(false, SignatureType.BASIC, 'true'))).toBeTruthy();
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
      claim.respondent1 = new Respondent();
      claim.respondent1.type = CounterpartyType.ORGANISATION;
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
      claim.respondent1 = new Respondent();
      claim.respondent1.type = CounterpartyType.SOLE_TRADER;
      expect(getSignatureType(claim)).toEqual(SignatureType.BASIC);
    });

    it('should return basic signature type if respondent is company', () => {
      claim.respondent1 = new Respondent();
      claim.respondent1.type = CounterpartyType.COMPANY;
      expect(getSignatureType(claim)).toEqual(SignatureType.QUALIFIED);
    });

    it('should return basic signature type if respondent is organisation', () => {
      claim.respondent1 = new Respondent();
      claim.respondent1.type = CounterpartyType.ORGANISATION;
      expect(getSignatureType(claim)).toEqual(SignatureType.QUALIFIED);
    });
  });
});
