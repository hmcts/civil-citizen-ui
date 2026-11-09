import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {Interest} from 'form/models/interest/interest';
import {InterestStartDate} from 'form/models/interest/interestStartDate';
import {
  InterestClaimFromType,
  InterestEndDateType,
  SameRateInterestSelection,
  SameRateInterestType,
} from 'form/models/claimDetails';
import {TotalInterest} from 'form/models/interest/totalInterest';
import {InterestClaimOptionsType} from 'form/models/claim/interest/interestClaimOptionsType';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';

jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const mockReq = {
  session: {
    draftId: 'test-draft-id',
  },
} as unknown as AppRequest;

const mockSameRateInterestSelectionWithValues: SameRateInterestSelection = {
  sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
  differentRate: 40,
  reason: 'Reasons here...',
};

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

describe('Interest Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInterest', () => {
    it('should return empty Interest if interest is not set', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));

      const interest = await getInterest(mockReq);

      expect(mockGetDraftClaim).toHaveBeenCalledWith(mockReq);
      expect(interest).toBeInstanceOf(Interest);
      expect(interest?.interestStartDate).toBeUndefined();
    });

    it('should return Interest object with interest start date', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      claim.interest.interestStartDate = {
        day: 2,
        month: 2,
        year: 2022,
        reason: 'test',
      };
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const interest = await getInterest(mockReq);

      expect(interest?.interestStartDate?.day).toBe(2);
      expect(interest?.interestStartDate?.month).toBe(2);
      expect(interest?.interestStartDate?.year).toBe(2022);
      expect(interest?.interestStartDate?.reason).toBe('test');
    });

    it('should return Interest object with interest end date', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      claim.interest.interestEndDate = InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const interest = await getInterest(mockReq);

      expect(interest?.interestEndDate).toBe(InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE);
    });

    it('should return Interest object with interest claim from', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      claim.interest.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const interest = await getInterest(mockReq);

      expect(interest?.interestClaimFrom).toBe(InterestClaimFromType.FROM_A_SPECIFIC_DATE);
    });

    it('should return Interest object with interest claim options', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      claim.interest.interestClaimOptions = InterestClaimOptionsType.BREAK_DOWN_INTEREST;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const interest = await getInterest(mockReq);

      expect(interest?.interestClaimOptions).toBe(InterestClaimOptionsType.BREAK_DOWN_INTEREST);
    });

    it('should return Interest object with same rate interest selection', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      claim.interest.sameRateInterestSelection = mockSameRateInterestSelectionWithValues;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const interest = await getInterest(mockReq);

      expect(interest?.sameRateInterestSelection).toBe(mockSameRateInterestSelectionWithValues);
    });

    it('should throw on manager failure', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getInterest(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveInterest', () => {
    it('should save interest start date', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue({});
      const startDate = new InterestStartDate('1', '1', '2021', 'test');

      await saveInterest(mockReq, startDate, 'interestStartDate');

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          interest: expect.objectContaining({interestStartDate: startDate}),
        }),
        'test-draft-id',
      );
    });

    it('should create Interest when missing and save total interest', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});
      const totalInterest = new TotalInterest('23', 'this is my reason');

      await saveInterest(mockReq, totalInterest, 'totalInterest');

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          interest: expect.objectContaining({totalInterest}),
        }),
        'test-draft-id',
      );
    });

    it('should update interest end date', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveInterest(mockReq, InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE, 'interestEndDate');

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          interest: expect.objectContaining({
            interestEndDate: InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE,
          }),
        }),
        'test-draft-id',
      );
    });

    it('should update interest claim from', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveInterest(mockReq, InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE, 'interestClaimFrom');

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          interest: expect.objectContaining({
            interestClaimFrom: InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE,
          }),
        }),
        'test-draft-id',
      );
    });

    it('should clear breakdown interest when saving SAME_RATE_INTEREST option', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      claim.interest.interestClaimOptions = InterestClaimOptionsType.SAME_RATE_INTEREST;
      claim.interest.totalInterest = new TotalInterest('10', 'old');
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveInterest(mockReq, InterestClaimOptionsType.SAME_RATE_INTEREST, 'interestClaimOptions');

      const savedClaim = mockUpdateDraftClaim.mock.calls[0][1] as Claim;
      expect(savedClaim.interest?.interestClaimOptions).toBe(InterestClaimOptionsType.SAME_RATE_INTEREST);
      expect(savedClaim.interest?.totalInterest).toBeUndefined();
    });

    it('should clear same-rate fields when saving BREAK_DOWN_INTEREST option', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      claim.interest.interestClaimOptions = InterestClaimOptionsType.BREAK_DOWN_INTEREST;
      claim.interest.interestStartDate = new InterestStartDate('1', '1', '2021', 'test');
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveInterest(mockReq, InterestClaimOptionsType.BREAK_DOWN_INTEREST, 'interestClaimOptions');

      const savedClaim = mockUpdateDraftClaim.mock.calls[0][1] as Claim;
      expect(savedClaim.interest?.interestClaimOptions).toBe(InterestClaimOptionsType.BREAK_DOWN_INTEREST);
      expect(savedClaim.interest?.interestStartDate).toBeUndefined();
    });

    it('should update same rate interest selection', async () => {
      const claim = new Claim();
      claim.interest = new Interest();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveInterest(mockReq, mockSameRateInterestSelectionWithValues, 'sameRateInterestSelection');

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          interest: expect.objectContaining({
            sameRateInterestSelection: mockSameRateInterestSelectionWithValues,
          }),
        }),
        'test-draft-id',
      );
    });

    it('should map createdAt when missing on save', async () => {
      const createdAtTimestamp = '2026-08-01T10:00:00.000Z';
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim(), createdAtTimestamp));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveInterest(mockReq, new InterestStartDate('1', '1', '2021', 'test'), 'interestStartDate');

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

      await expect(saveInterest(mockReq, new InterestStartDate('1', '1', '2021', 'test'), 'interestStartDate'))
        .rejects.toThrow('[interestService] no draft claim found to update');
      expect(mockUpdateDraftClaim).not.toHaveBeenCalled();
    });

    it('should throw on manager update failure', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveInterest(mockReq, new InterestStartDate('1', '1', '2021', 'test'), 'interestStartDate'))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
