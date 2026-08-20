import {AppRequest} from 'models/AppRequest';
import {
  getClaimantInformation,
  saveClaimant,
  saveClaimantProperty,
} from 'services/features/claim/yourDetails/claimantDetailsService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {Claim} from 'models/claim';
import {buildAddress, mockClaim} from '../../../../../utils/mockClaim';
import {Party} from 'models/party';
import {YesNo} from 'form/models/yesNo';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyType} from 'models/partyType';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const mockReq = {
  session: {
    draftId: 'test-draft-id',
  },
} as unknown as AppRequest;

const createMockManagerResult = (claim: Claim, createdAt = '2026-08-01T10:00:00.000Z'): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: 'test-draft-id',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt,
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

const partyDetails = new PartyDetails({
  title: 'Mr.',
  firstName: 'John',
  lastName: 'Doe',
});
partyDetails.primaryAddress = buildAddress();
partyDetails.provideCorrespondenceAddress = YesNo.NO;

describe('Citizen details service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClaimantInformation', () => {
    it('should return an empty Party when no applicant1 is stored', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));

      const result = await getClaimantInformation(mockReq);

      expect(mockGetDraftClaim).toHaveBeenCalledWith(mockReq);
      expect(result).toBeInstanceOf(Party);
    });

    it('should return applicant1 when a draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      const result = await getClaimantInformation(mockReq);

      expect(result).toEqual(expect.objectContaining({
        partyDetails: mockClaim.applicant1.partyDetails,
      }));
    });
  });

  describe('saveClaimant', () => {
    it('should create applicant1 and save party details', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimant(mockReq, partyDetails);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          applicant1: expect.objectContaining({
            partyDetails: expect.objectContaining({
              title: 'Mr.',
              firstName: 'John',
              lastName: 'Doe',
            }),
          }),
        }),
        'test-draft-id',
      );
    });

    it('should update existing applicant1 party details', async () => {
      const claim = new Claim();
      claim.applicant1 = new Party();
      claim.applicant1.partyDetails = new PartyDetails({});
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimant(mockReq, partyDetails);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          applicant1: expect.objectContaining({
            partyDetails: expect.objectContaining({
              firstName: 'John',
              lastName: 'Doe',
            }),
          }),
        }),
        'test-draft-id',
      );
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(saveClaimant(mockReq, partyDetails)).rejects.toThrow(
        '[claimantDetailsService] no draft claim found to update',
      );
      expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
    });
  });

  describe('saveClaimantProperty', () => {
    it('should save a property when applicant1 does not exist', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimantProperty(mockReq, 'type', PartyType.INDIVIDUAL);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          applicant1: expect.objectContaining({
            type: PartyType.INDIVIDUAL,
          }),
        }),
        'test-draft-id',
      );
    });

    it('should update type when applicant1 already exists', async () => {
      const claim = new Claim();
      claim.applicant1 = new Party();
      claim.applicant1.type = PartyType.ORGANISATION;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimantProperty(mockReq, 'type', PartyType.INDIVIDUAL);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          applicant1: expect.objectContaining({
            type: PartyType.INDIVIDUAL,
          }),
        }),
        'test-draft-id',
      );
    });

    it('should map createdAt when missing on save', async () => {
      const createdAtTimestamp = '2026-08-01T10:00:00.000Z';
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim(), createdAtTimestamp));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveClaimantProperty(mockReq, 'type', PartyType.INDIVIDUAL);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          draftClaimCreatedAt: new Date(createdAtTimestamp),
        }),
        'test-draft-id',
      );
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(saveClaimantProperty(mockReq, 'type', PartyType.INDIVIDUAL)).rejects.toThrow(
        '[claimantDetailsService] no draft claim found to update',
      );
    });

    it('should throw on manager failure', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveClaimantProperty(mockReq, 'type', PartyType.INDIVIDUAL))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
