import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {getDefendantEmail, saveDefendantEmail} from 'services/features/claim/yourDetails/defendantEmailService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {PartyType} from 'models/partyType';
import {Party} from 'models/party';
import {DefendantEmail} from 'form/models/claim/yourDetails/defendantEmail';
import {Email} from 'models/Email';

jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const EMAIL_ADDRESS = 'test@gmail.com';

const mockReq = {
  session: {
    user: {id: '123'},
    draftId: 'draft-123',
  },
} as unknown as AppRequest;

const createRespondent = (): Party => ({
  partyDetails: {
    postToThisAddress: '',
    title: '',
    lastName: '',
    firstName: '',
    partyName: '',
    contactPerson: '',
  },
  responseType: '',
  type: PartyType.INDIVIDUAL,
});

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

describe('Claimant Defendant Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClaimantDefendantEmail', () => {
    it('should get empty form when no data exist', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));

      const form = await getDefendantEmail(mockReq);

      expect(form.emailAddress).toBeUndefined();
    });

    it('should get empty form when claimant defendant email does not exist', async () => {
      const claim = new Claim();
      claim.respondent1 = createRespondent();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const form = await getDefendantEmail(mockReq);

      expect(form.emailAddress).toBeUndefined();
    });

    it('should return populated form when claimant defendant email exists', async () => {
      const claim = new Claim();
      const respondent = createRespondent();
      respondent.emailAddress = new Email(EMAIL_ADDRESS);
      claim.respondent1 = respondent;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const form = await getDefendantEmail(mockReq);

      expect(form.emailAddress).toEqual(EMAIL_ADDRESS);
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(getDefendantEmail(mockReq)).rejects.toThrow(
        '[defendantEmailService] no draft claim found',
      );
    });

    it('should rethrow error when error occurs', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getDefendantEmail(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveClaimantDefendantEmail', () => {
    it('should save claimant defendant email successfully when claim exists', async () => {
      const claim = new Claim();
      claim.respondent1 = createRespondent();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveDefendantEmail(mockReq, new DefendantEmail(EMAIL_ADDRESS));

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          respondent1: expect.objectContaining({
            emailAddress: expect.objectContaining({emailAddress: EMAIL_ADDRESS}),
          }),
        }),
        'draft-123',
      );
    });

    it('should create respondent1 when missing', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveDefendantEmail(mockReq, new DefendantEmail(EMAIL_ADDRESS));

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          respondent1: expect.objectContaining({
            emailAddress: expect.objectContaining({emailAddress: EMAIL_ADDRESS}),
          }),
        }),
        'draft-123',
      );
    });

    it('should map createdAt when missing on save', async () => {
      const createdAtTimestamp = '2026-08-01T10:00:00.000Z';
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim(), createdAtTimestamp));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveDefendantEmail(mockReq, new DefendantEmail(EMAIL_ADDRESS));

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          draftClaimCreatedAt: new Date(createdAtTimestamp),
        }),
        'draft-123',
      );
    });

    it('should use rawResponse draftId when session has none', async () => {
      const reqWithoutDraftId = {session: {user: {id: '123'}}} as unknown as AppRequest;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveDefendantEmail(reqWithoutDraftId, new DefendantEmail(EMAIL_ADDRESS));

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(reqWithoutDraftId, expect.any(Claim), 'draft-123');
    });

    it('should throw when no draft exists on save', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(saveDefendantEmail(mockReq, new DefendantEmail(EMAIL_ADDRESS))).rejects.toThrow(
        '[defendantEmailService] no draft claim found',
      );
    });

    it('should rethrow error when error occurs on get claim', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveDefendantEmail(mockReq, new DefendantEmail(EMAIL_ADDRESS))).rejects.toThrow(
        TestMessages.REDIS_FAILURE,
      );
    });

    it('should rethrow error when error occurs on save claim', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveDefendantEmail(mockReq, new DefendantEmail(EMAIL_ADDRESS))).rejects.toThrow(
        TestMessages.REDIS_FAILURE,
      );
    });
  });
});
