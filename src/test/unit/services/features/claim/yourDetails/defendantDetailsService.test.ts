import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {buildAddress, mockClaim} from '../../../../../utils/mockClaim';
import {Party} from '../../../../../../main/common/models/party';
import {
  getDefendantInformation,
  getDefendantInformationFromDraft,
  saveDefendantProperty,
  saveDefendantPropertyToDraft,
} from '../../../../../../main/services/features/common/defendantDetailsService';
import {PartyType} from '../../../../../../main/common/models/partyType';
import {AppRequest} from 'models/AppRequest';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;
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

describe('Defendant details service', () => {
  describe('getDefendantInformation', () => {
    it('should return a empty object when no data retrieved', async () => {
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseData.mockImplementation(async () => {
        return {};
      });

      const result: Party = await getDefendantInformation(CLAIM_ID);
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual({});
    });

    it('should return a defendant object with values when data is retrieved', async () => {
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      mockGetCaseData.mockImplementation(async () => {
        return mockClaim;
      });

      const result: Party = await getDefendantInformation(CLAIM_ID);
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result).toEqual(mockClaim.respondent1);
    });
  });

  describe('saveDefendant', () => {
    it('should save a defendant when has no information on redis ', async () => {
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      const expectedData = new Claim();
      expectedData.respondent1 = {type: PartyType.INDIVIDUAL};

      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });

      await saveDefendantProperty(CLAIM_ID, 'type', PartyType.INDIVIDUAL);
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalledWith(CLAIM_ID, expectedData, false, CLAIM_ID);
    });

    it('should update defendant when in redis', async () => {
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const spySaveDraftClaim = jest.spyOn(draftStoreService, 'saveDraftClaim');
      mockGetCaseData.mockImplementation(async () => {
        const claim = mockClaim;
        claim.respondent1 = new Party();
        claim.respondent1 = {
          partyDetails: {
            primaryAddress: buildAddress(),
          },
          responseType: 'foo',
          type: PartyType.INDIVIDUAL,
        };
        return claim;
      });

      await saveDefendantProperty(CLAIM_ID, 'type', PartyType.ORGANISATION);
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(spySaveDraftClaim).toBeCalled();
    });
  });

  describe('getDefendantInformationFromDraft', () => {
    it('should return an empty Party when no respondent1 is stored', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));

      const result = await getDefendantInformationFromDraft(mockReq);

      expect(mockGetDraftClaim).toHaveBeenCalledWith(mockReq);
      expect(result).toBeInstanceOf(Party);
    });

    it('should return respondent1 when a draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));

      const result = await getDefendantInformationFromDraft(mockReq);

      expect(result).toEqual(expect.objectContaining({
        partyDetails: mockClaim.respondent1.partyDetails,
      }));
    });
  });

  describe('saveDefendantPropertyToDraft', () => {
    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(saveDefendantPropertyToDraft(mockReq, 'type', PartyType.INDIVIDUAL)).rejects.toThrow(
        '[defendantDetailsService] no draft claim found to update',
      );
      expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
    });

    it('should throw when the manager fails', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveDefendantPropertyToDraft(mockReq, 'type', PartyType.INDIVIDUAL)).rejects.toThrow(
        TestMessages.REDIS_FAILURE,
      );
    });

    it('should create respondent1 and save the property', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveDefendantPropertyToDraft(mockReq, 'type', PartyType.INDIVIDUAL);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          respondent1: expect.objectContaining({type: PartyType.INDIVIDUAL}),
          draftClaimCreatedAt: new Date('2026-08-01T10:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should update respondent1 when it already exists', async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.INDIVIDUAL;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveDefendantPropertyToDraft(mockReq, 'type', PartyType.ORGANISATION);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          respondent1: expect.objectContaining({type: PartyType.ORGANISATION}),
        }),
        'draft-123',
      );
    });
  });
});
