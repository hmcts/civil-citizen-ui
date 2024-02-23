import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {
  getDefendantEmail,
  saveDefendantEmail,
} from '../../../../../main/services/features/claim/yourDetails/defendantEmailService';
import {Claim} from '../../../../../main/common/models/claim';
import {PartyType} from '../../../../../main/common/models/partyType';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {Party} from '../../../../../main/common/models/party';
import {DefendantEmail} from '../../../../../main/common/form/models/claim/yourDetails/defendantEmail';
import {Email} from '../../../../../main/common/models/Email';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const EMAIL_ADDRESS = 'test@gmail.com';

const respondent: Party = {
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
};

describe('Claimant Defendant Email Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getClaimantDefendantEmail', () => {
    it('should get empty form when no data exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getDefendantEmail('123');
      //Then
      expect(form.emailAddress).toBeUndefined();
      expect(form.emailAddress).toEqual(undefined);
    });

    it('should get empty form when claimant defendant email does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = respondent;
        return claim;
      });
      //When
      const form = await getDefendantEmail('123');
      //Then
      expect(form.emailAddress).toBeUndefined();
    });

    it('should return populated form when claimant defendant email exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        respondent.emailAddress = new Email(EMAIL_ADDRESS);
        claim.respondent1 = respondent;
        return claim;
      });
      //When
      const form = await getDefendantEmail('123');

      //Then
      expect(form.emailAddress).toEqual(EMAIL_ADDRESS);
    });

    it('should rethrow error when error occurs', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(getDefendantEmail('123')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveClaimantDefendantEmail', () => {
    it('should save claimant defendant email successfully when claim exists', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.respondent1 = respondent;
        return claim;

      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveDefendantEmail('123', new DefendantEmail(EMAIL_ADDRESS));
      //Then
      expect(spySave).toBeCalled();
    });

    it('should rethrow error when error occurs on get claim', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveDefendantEmail('123', new DefendantEmail(EMAIL_ADDRESS))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });

    it('should rethrow error when error occurs on save claim', async () => {
      //Given
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(saveDefendantEmail('123', new DefendantEmail(EMAIL_ADDRESS))).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
