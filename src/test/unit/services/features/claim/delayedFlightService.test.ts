import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {
  deleteDelayedFlight,
  getDelayedFlight,
  getFlightDetails,
  saveDelayedFlight,
  saveFlightDetails,
  buildDataList,
} from 'services/features/claim/delayedFlightService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {YesNo} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {FlightDetails} from 'common/models/flightDetails';
import {AirlineList} from 'common/models/airlines/flights';

jest.mock('modules/draft-store/draftStoreManagerService');

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

describe('Delayed Flight Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDelayedFlight', () => {
    it('should get empty form when no data exist', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));

      const form = await getDelayedFlight(mockReq);

      expect(form.option).toBeUndefined();
    });

    it('should return populated form when delayed flight exists', async () => {
      const claim = new Claim();
      claim.delayedFlight = new GenericYesNo(YesNo.YES);
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const form = await getDelayedFlight(mockReq);

      expect(form.option).toEqual(YesNo.YES);
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(getDelayedFlight(mockReq)).rejects.toThrow(
        '[delayedFlightService] no draft claim found',
      );
    });

    it('should rethrow error when error occurs', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getDelayedFlight(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('getFlightDetails', () => {
    it('should get empty form when no data exist', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));

      const form = await getFlightDetails(mockReq);

      expect(form.airline).toBeUndefined();
      expect(form.flightNumber).toBeUndefined();
      expect(form.flightDate).toBeUndefined();
    });

    it('should return populated form when delayed flight exists', async () => {
      const flightDetails = new FlightDetails('airline', '123456', '2023', '9', '29');
      const claim = new Claim();
      claim.flightDetails = flightDetails;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const form = await getFlightDetails(mockReq);

      expect(form).toMatchObject(flightDetails);
    });

    it('should return populated form from stored numeric flight fields', async () => {
      const claim = new Claim();
      claim.flightDetails = {
        airline: 'Ryanair',
        flightNumber: '123',
        year: 2023,
        month: 9,
        day: 29,
      } as unknown as FlightDetails;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));

      const form = await getFlightDetails(mockReq);

      expect(form.airline).toEqual('Ryanair');
      expect(form.flightNumber).toEqual('123');
    });

    it('should rethrow error when error occurs', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getFlightDetails(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveDelayedFlight', () => {
    it('should save delayedFlight', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});
      const delayedFlight = new GenericYesNo(YesNo.YES);

      await saveDelayedFlight(mockReq, delayedFlight);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({delayedFlight}),
        'draft-123',
      );
    });

    it('should map createdAt when missing on save', async () => {
      const createdAtTimestamp = '2026-08-01T10:00:00.000Z';
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim(), createdAtTimestamp));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveDelayedFlight(mockReq, new GenericYesNo(YesNo.YES));

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          draftClaimCreatedAt: new Date(createdAtTimestamp),
        }),
        'draft-123',
      );
    });

    it('should throw an error', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveDelayedFlight(mockReq, new GenericYesNo(YesNo.YES))).rejects.toThrow(
        TestMessages.REDIS_FAILURE,
      );
    });
  });

  describe('saveFlightDetails', () => {
    const flightDetails = new FlightDetails('airline', '123456', '2023', '9', '29');

    it('should save flightDetails', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveFlightDetails(mockReq, flightDetails);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({flightDetails}),
        'draft-123',
      );
    });

    it('should throw an error', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveFlightDetails(mockReq, flightDetails)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('deleteDelayedFlight', () => {
    it('should delete delayed flight via the manager', async () => {
      const claim = new Claim();
      claim.delayedFlight = new GenericYesNo(YesNo.YES);
      claim.flightDetails = new FlightDetails('airline', '123456', '2023', '9', '29');
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue({});

      await deleteDelayedFlight(mockReq);

      expect(mockGetDraftClaim).toHaveBeenCalledWith(mockReq);
      expect(mockUpdateDraftClaim).toHaveBeenCalledTimes(1);
      const savedClaim = mockUpdateDraftClaim.mock.calls[0][1] as Claim;
      expect(mockUpdateDraftClaim.mock.calls[0][0]).toBe(mockReq);
      expect(mockUpdateDraftClaim.mock.calls[0][2]).toBe('draft-123');
      expect(savedClaim.delayedFlight).toBeUndefined();
      expect(savedClaim.flightDetails).toBeUndefined();
      expect(savedClaim.draftClaimCreatedAt).toEqual(new Date('2026-08-01T10:00:00.000Z'));
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(deleteDelayedFlight(mockReq)).rejects.toThrow('[delayedFlightService] no draft claim found');
    });

    it('should throw when the manager fails', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(deleteDelayedFlight(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('buildDataList', () => {
    it('should render airline options and hide the error message when valid', () => {
      const html = buildDataList(
        [{airline: 'Ryanair', epimsID: '1'}, {airline: 'OTHER', epimsID: '2'}] as AirlineList[],
        false,
        'Ryanair',
        'en',
      );

      expect(html).toContain('Ryanair');
      expect(html).not.toContain('OTHER');
      expect(html).toContain('govuk-visually-hidden');
    });

    it('should show an error state when the airline is invalid', () => {
      const html = buildDataList([], true, '', 'en');

      expect(html).toContain('govuk-form-group--error');
      expect(html).toContain('govuk-error-message');
    });
  });
});
