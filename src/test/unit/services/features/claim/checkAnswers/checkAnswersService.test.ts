import {
  getSignatureType,
  getStatementOfTruth,
  saveStatementOfTruth,
} from 'services/features/claim/checkAnswers/checkAnswersService';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {SignatureType} from 'models/signatureType';
import {
  createClaimWithBasicClaimDetails,
  createClaimWithBasicDetails,
} from '../../../../../utils/mockClaimForCheckAnswers';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {Claim} from 'models/claim';
import {CLAIM_ID} from '../../../../../utils/checkAnswersConstants';
import {ResponseType} from 'form/models/responseType';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {StatementOfTruthFormClaimIssue} from 'form/models/statementOfTruth/statementOfTruthFormClaimIssue';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));
afterEach(() => {
  jest.clearAllMocks();
});

const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;

const expectedStatementOfTruth = {
  isFullAmountRejected: false,
  type: 'basic',
  directionsQuestionnaireSigned: true,
  signed: true,
  acceptNoChangesAllowed: false,
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
        claim.claimDetails = new ClaimDetails();
        claim.claimDetails.statementOfTruth = {isFullAmountRejected: false, type: SignatureType.BASIC, signed: true, acceptNoChangesAllowed: false};
        return claim;
      });

      //Then
      await expect(
        saveStatementOfTruth(CLAIM_ID, new StatementOfTruthFormClaimIssue(false, SignatureType.BASIC, true))).toBeTruthy();
    });
  });

  describe('getStatementOfTruth', () => {
    let claim: Claim;

    beforeEach(() => {
      claim = createClaimWithBasicDetails();
    });

    it('should return statement of truth if it is set in the draft store', () => {
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      claim.claimDetails.statementOfTruth = new StatementOfTruthFormClaimIssue(false, SignatureType.BASIC, true, true, false);
      expect(getStatementOfTruth(claim)).toEqual(expectedStatementOfTruth);
    });

    it('should create new statement of truth if signature type is basic', () => {
      expect(getStatementOfTruth(claim)).toEqual({isFullAmountRejected: false, type: 'basic'});
    });

    it('should create new qualified statement of truth if signature type is qualified', () => {
      claim.applicant1 = new Party();
      claim.applicant1.type = PartyType.ORGANISATION;
      expect(getStatementOfTruth(claim)).toEqual({isFullAmountRejected: false, type: 'qualified'});
    });
  });

  describe('getSignatureType', () => {
    let claim: Claim;

    beforeEach(() => {
      claim = createClaimWithBasicClaimDetails();
    });

    it('should return basic signature type if respondent is individual', () => {
      expect(getSignatureType(claim)).toEqual(SignatureType.BASIC);
    });

    it('should return basic signature type if respondent is sole trader', () => {
      claim.applicant1 = new Party();
      claim.applicant1.type = PartyType.SOLE_TRADER;
      expect(getSignatureType(claim)).toEqual(SignatureType.BASIC);
    });

    it('should return basic signature type if respondent is company', () => {
      claim.applicant1 = new Party();
      claim.applicant1.type = PartyType.COMPANY;
      expect(getSignatureType(claim)).toEqual(SignatureType.QUALIFIED);
    });

    it('should return basic signature type if respondent is organisation', () => {
      claim.applicant1 = new Party();
      claim.applicant1.type = PartyType.ORGANISATION;
      expect(getSignatureType(claim)).toEqual(SignatureType.QUALIFIED);
    });
  });
});
