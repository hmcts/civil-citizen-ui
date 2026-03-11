import {submitExtendedResponseDeadline} from 'services/features/response/responseDeadline/extendResponseDeadlineService';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import {ResponseOptions} from 'form/models/responseDeadline';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {AppRequest, AppSession} from 'models/AppRequest';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {CivilServiceClient} from '../../../../../../main/app/client/civilServiceClient';

jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.MockedFunction<typeof draftStoreService.getCaseDataFromStore>;
const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.MockedFunction<typeof draftStoreService.saveDraftClaim>;

const buildRequest = (): AppRequest => ({
  params: {id: '1'},
  session: {user: {id: '1234'}} as AppSession,
} as AppRequest);

const buildClaim = (): Claim => {
  const claim = new Claim();
  claim.applicant1 = {
    partyDetails: {
      partyName: 'Mr. James Bond',
    },
    type: PartyType.INDIVIDUAL,
  };
  claim.responseDeadline = {
    agreedResponseDeadline: new Date('2024-01-10T00:00:00.000Z'),
    calculatedResponseDeadline: new Date('2024-01-10T00:00:00.000Z'),
    option: ResponseOptions.ALREADY_AGREED,
  };

  return claim;
};

describe('Extend ResponseDeadline Service', () => {
  let req: AppRequest;
  let submitAgreedResponseExtensionDateEventSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    req = buildRequest();
    submitAgreedResponseExtensionDateEventSpy = jest
      .spyOn(CivilServiceClient.prototype, 'submitAgreedResponseExtensionDateEvent')
      .mockResolvedValue({} as Claim);
  });

  afterEach(() => {
    submitAgreedResponseExtensionDateEventSpy.mockRestore();
  });

  describe('submitExtendedResponseDeadline', () => {
    it('should submit event when task is incomplete', async () => {
      const claim = buildClaim();
      mockGetCaseDataFromStore.mockResolvedValue(claim);

      await submitExtendedResponseDeadline(req);

      expect(submitAgreedResponseExtensionDateEventSpy).toHaveBeenCalledWith(
        '1',
        {
          respondentSolicitor1AgreedDeadlineExtension: claim.responseDeadline.calculatedResponseDeadline,
          respondent1LiPResponse: {
            respondent1ResponseLanguage: 'BOTH',
          },
        },
        req,
      );
      expect(mockSaveDraftClaim).toHaveBeenCalledWith('11234', claim);
    });

    it('should not submit event when task is complete', async () => {
      const claim = buildClaim();
      claim.respondentSolicitor1AgreedDeadlineExtension = new Date('2024-01-11T00:00:00.000Z');
      mockGetCaseDataFromStore.mockResolvedValue(claim);

      await submitExtendedResponseDeadline(req);

      expect(submitAgreedResponseExtensionDateEventSpy).not.toHaveBeenCalled();
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });

    it('should rethrow exception when redis throws exception', async () => {
      mockGetCaseDataFromStore.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(submitExtendedResponseDeadline(req)).rejects.toThrow(TestMessages.REDIS_FAILURE);
      expect(submitAgreedResponseExtensionDateEventSpy).not.toHaveBeenCalled();
      expect(mockSaveDraftClaim).not.toHaveBeenCalled();
    });
  });
});
