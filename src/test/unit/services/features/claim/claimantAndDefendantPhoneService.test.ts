import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {
  getTelephone,
  getTelephoneFromStore,
  saveTelephone,
  saveTelephoneToStore,
} from 'services/features/claim/yourDetails/phoneService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {CitizenTelephoneNumber} from 'form/models/citizenTelephoneNumber';
import {ClaimantOrDefendant, PartyType} from 'models/partyType';
import {Party} from 'models/party';
import {PartyPhone} from 'models/PartyPhone';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;

const PHONE_NUMBER = '01632960001';
const CLAIM_ID = '123';

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

describe('Claimant Phone Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTelephone (claim-issue)', () => {
    it('should get empty form when no data exist for applicant', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));

      const form = await getTelephone(mockReq, ClaimantOrDefendant.CLAIMANT);

      expect(form.telephoneNumber).toBeUndefined();
    });

    it('should get empty form when no data exist for defendant', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));

      const form = await getTelephone(mockReq, ClaimantOrDefendant.DEFENDANT);

      expect(form.telephoneNumber).toBeUndefined();
    });

    it('should get empty form when claimant phone does not exist', async () => {
      const claim = new Claim();
      claim.applicant1 = new Party();
      claim.applicant1.type = PartyType.INDIVIDUAL;
      claim.applicant1.partyPhone = new PartyPhone('');
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const form = await getTelephone(mockReq, ClaimantOrDefendant.CLAIMANT);

      expect(form.telephoneNumber).toEqual('');
    });

    it('should get empty form when defendant phone does not exist', async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.partyPhone = new PartyPhone('');
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const form = await getTelephone(mockReq, ClaimantOrDefendant.DEFENDANT);

      expect(form.telephoneNumber).toEqual('');
    });

    it('should return populated form when claimant phone exists', async () => {
      const claim = new Claim();
      claim.applicant1 = new Party();
      claim.applicant1.partyPhone = new PartyPhone(PHONE_NUMBER);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const form = await getTelephone(mockReq, ClaimantOrDefendant.CLAIMANT);

      expect(form.telephoneNumber).toEqual(PHONE_NUMBER);
    });

    it('should return populated form when defendant phone exists', async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.partyPhone = new PartyPhone(PHONE_NUMBER);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const form = await getTelephone(mockReq, ClaimantOrDefendant.DEFENDANT);

      expect(form.telephoneNumber).toEqual(PHONE_NUMBER);
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(getTelephone(mockReq, ClaimantOrDefendant.CLAIMANT)).rejects.toThrow(
        '[phoneService] no draft claim found',
      );
    });

    it('should rethrow error when error occurs for applicant', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getTelephone(mockReq, ClaimantOrDefendant.CLAIMANT)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveTelephone (claim-issue)', () => {
    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(
        saveTelephone(mockReq, new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.CLAIMANT),
      ).rejects.toThrow('[phoneService] no draft claim found');
    });

    it('should save claimant phone data when applicant1 is missing', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveTelephone(mockReq, new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.CLAIMANT);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          applicant1: expect.objectContaining({
            partyPhone: expect.objectContaining({phone: PHONE_NUMBER}),
          }),
        }),
        'draft-123',
      );
    });

    it('should use rawResponse draftId when session has none', async () => {
      const reqWithoutDraftId = {session: {user: {id: '123'}}} as unknown as AppRequest;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveTelephone(reqWithoutDraftId, new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.CLAIMANT);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(reqWithoutDraftId, expect.any(Claim), 'draft-123');
    });

    it('should save defendant phone data when respondent1 is missing', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveTelephone(mockReq, new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.DEFENDANT);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          respondent1: expect.objectContaining({
            partyPhone: expect.objectContaining({phone: PHONE_NUMBER}),
          }),
        }),
        'draft-123',
      );
    });

    it('should save defendant phone with ccdPhoneExist', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveTelephone(mockReq, new CitizenTelephoneNumber(PHONE_NUMBER, true), ClaimantOrDefendant.DEFENDANT);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          respondent1: expect.objectContaining({
            partyPhone: expect.objectContaining({phone: PHONE_NUMBER, ccdPhoneExist: true}),
          }),
        }),
        'draft-123',
      );
    });

    it('should map createdAt when missing on save', async () => {
      const createdAtTimestamp = '2026-08-01T10:00:00.000Z';
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim(), createdAtTimestamp));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveTelephone(mockReq, new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.CLAIMANT);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          draftClaimCreatedAt: new Date(createdAtTimestamp),
        }),
        'draft-123',
      );
    });

    it('should rethrow error when the manager fails', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(
        saveTelephone(mockReq, new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.CLAIMANT),
      ).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('getTelephoneFromStore (response Redis)', () => {
    it('should return populated form when claimant phone exists in Redis', async () => {
      const claim = new Claim();
      claim.applicant1 = new Party();
      claim.applicant1.partyPhone = new PartyPhone(PHONE_NUMBER);
      mockGetCaseData.mockResolvedValue(claim);

      const form = await getTelephoneFromStore(CLAIM_ID, ClaimantOrDefendant.CLAIMANT);

      expect(form.telephoneNumber).toEqual(PHONE_NUMBER);
    });

    it('should get empty form when no data exist for defendant', async () => {
      mockGetCaseData.mockResolvedValue(new Claim());

      const form = await getTelephoneFromStore(CLAIM_ID, ClaimantOrDefendant.DEFENDANT);

      expect(form.telephoneNumber).toBeUndefined();
    });

    it('should return populated form when defendant phone exists', async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.partyPhone = new PartyPhone(PHONE_NUMBER);
      mockGetCaseData.mockResolvedValue(claim);

      const form = await getTelephoneFromStore(CLAIM_ID, ClaimantOrDefendant.DEFENDANT);

      expect(form.telephoneNumber).toEqual(PHONE_NUMBER);
    });

    it('should rethrow error when Redis fails', async () => {
      mockGetCaseData.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getTelephoneFromStore(CLAIM_ID, ClaimantOrDefendant.DEFENDANT)).rejects.toThrow(
        TestMessages.REDIS_FAILURE,
      );
    });
  });

  describe('saveTelephoneToStore (response Redis)', () => {
    it('should save defendant phone to Redis', async () => {
      mockGetCaseData.mockResolvedValue(new Claim());
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');

      await saveTelephoneToStore(CLAIM_ID, new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.DEFENDANT);

      expect(spySave).toHaveBeenCalledWith(
        CLAIM_ID,
        expect.objectContaining({
          respondent1: expect.objectContaining({
            partyPhone: expect.objectContaining({phone: PHONE_NUMBER}),
          }),
        }),
      );
    });

    it('should rethrow error when Redis get fails', async () => {
      mockGetCaseData.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(
        saveTelephoneToStore(CLAIM_ID, new CitizenTelephoneNumber(PHONE_NUMBER), ClaimantOrDefendant.DEFENDANT),
      ).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
