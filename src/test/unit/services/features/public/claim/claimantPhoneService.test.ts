import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {getClaimantPhone,getUserId,saveClaimantPhone} from '../../../../../../main/services/features/claim/claimantPhoneService';
import {Claim, Party} from '../../../../../../main/common/models/claim';
import {CounterpartyType} from '../../../../../../main/common/models/counterpartyType';
import {CorrespondenceAddress} from '../../../../../../main/common/models/correspondenceAddress';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {ClaimantPhoneNumber} from '../../../../../../main/common/form/models/claim/claimantPhoneNumber';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/features/claim/claimantPhoneService', () => ({
  ...jest.requireActual('../../../../../../main/services/features/claim/claimantPhoneService'),
  getUserId: jest.fn(),
}));

const correspondenceAddress: CorrespondenceAddress = {
  County: '',
  Country: '',
  PostCode: '',
  PostTown: '',
  AddressLine1: '',
  AddressLine2: '',
  AddressLine3: '',
};
const party: Party = {
  individualTitle: '',
  individualLastName: '',
  individualFirstName: '',
  soleTraderTitle: '',
  soleTraderFirstName: '',
  soleTraderLastName: '',
  partyName: '',
  type: CounterpartyType.INDIVIDUAL,
  primaryAddress: correspondenceAddress,
  phoneNumber: '',
};

const PHONE_NUMBER = '01632960001';

describe('Claimant Phone Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const mockGetUserId = getUserId as jest.Mock;

  describe('getUserId', () => {
    it('should get user id when exist', async () => {
      //Given
      mockGetUserId.mockImplementation(async () => {
        return '123';
      });
      //When
      const userId = await getUserId();
      //Then
      expect(userId).toEqual('123');
    });
  });
  describe('getClaimantPhone', () => {
    it('should get empty form when no data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getClaimantPhone('123');
      //Then
      expect(form.phoneNumber).toBeUndefined();
      expect(form.phoneNumber).toEqual(undefined);
    });

    it('should get empty form when claimant pnone does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = party;
        return claim;
      });
      //When
      const form = await getClaimantPhone('123');
      //Then
      expect(form.phoneNumber).toEqual('');
    });

    it('should return populated form when claimant phone exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        party.phoneNumber = PHONE_NUMBER;
        claim.applicant1 = party;
        return claim;
      });
      //When
      const form = await getClaimantPhone('123');

      //Then
      expect(form.phoneNumber).toEqual(PHONE_NUMBER);
    });

    it('should rethrow error when error occurs', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getClaimantPhone('123')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveClaimantPhone', () => {
    it('should save claimant phone data successfully when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.applicant1 = party;
        return claim;

      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveClaimantPhone('123', new ClaimantPhoneNumber(PHONE_NUMBER));
      //Then
      expect(spySave).toBeCalled();
    });

    it('should rethrow error when error occurs on get claim', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveClaimantPhone('123', new ClaimantPhoneNumber(PHONE_NUMBER))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should rethrow error when error occurs on save claim', async () => {
      //Given
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveClaimantPhone('123', new ClaimantPhoneNumber(PHONE_NUMBER))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
