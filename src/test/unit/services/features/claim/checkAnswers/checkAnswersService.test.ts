import {
  getSignatureType,
  getStatementOfTruth,
  saveStatementOfTruth,
} from 'services/features/claim/checkAnswers/checkAnswersService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {SignatureType} from 'models/signatureType';
import {
  createClaimWithBasicClaimDetails,
  createClaimWithBasicDetails,
} from '../../../../../utils/mockClaimForCheckAnswers';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {Claim} from 'models/claim';
import {ResponseType} from 'form/models/responseType';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {StatementOfTruthFormClaimIssue} from 'form/models/statementOfTruth/statementOfTruthFormClaimIssue';
import {AppRequest} from 'models/AppRequest';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('modules/draft-store/draftStoreManagerService');
jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const mockReq = {
  session: {
    user: {id: '123'},
    draftId: 'draft-123',
  },
} as unknown as AppRequest;

const createMockManagerResult = (claim: Claim, createdAt = '2026-08-01T10:00:00.000Z'): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: 'draft-123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt,
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

afterEach(() => {
  jest.clearAllMocks();
});

const expectedStatementOfTruth = {
  isFullAmountRejected: false,
  type: 'basic',
  directionsQuestionnaireSigned: true,
  signed: true,
  acceptNoChangesAllowed: false,
};

describe('Check Answers service', () => {
  describe('saveStatementOfTruth', () => {
    const statementOfTruth = new StatementOfTruthFormClaimIssue(false, SignatureType.BASIC, true);

    it('should throw error when the manager fails', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveStatementOfTruth(mockReq, statementOfTruth)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(saveStatementOfTruth(mockReq, statementOfTruth)).rejects.toThrow(
        '[checkAnswersService] no draft claim found',
      );
      expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
    });

    it('should save statement of truth on the draft claim', async () => {
      const claim = new Claim();
      claim.claimDetails = new ClaimDetails();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveStatementOfTruth(mockReq, statementOfTruth);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          claimDetails: expect.objectContaining({
            statementOfTruth,
          }),
        }),
        'draft-123',
      );
    });

    it('should create claimDetails when missing', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveStatementOfTruth(mockReq, statementOfTruth);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          claimDetails: expect.objectContaining({
            statementOfTruth,
          }),
        }),
        'draft-123',
      );
    });

    it('should map createdAt when missing on save', async () => {
      const createdAtTimestamp = '2026-08-01T10:00:00.000Z';
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim(), createdAtTimestamp));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveStatementOfTruth(mockReq, statementOfTruth);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          draftClaimCreatedAt: new Date(createdAtTimestamp),
        }),
        'draft-123',
      );
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
