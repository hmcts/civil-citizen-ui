import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {
  getFullAdmitSetDatePaymentDetails,
} from '../../../../../main/services/features/claimantResponse/fullAdmitSetDatePaymentService';
import {Claim} from '../../../../../main/common/models/claim';
import {ClaimantResponse} from '../../../../../main/common/models/claimantResponse';
import {YesNo} from '../../../../../main/common/form/models/yesNo';
import {formatDateToFullDate} from '../../../../../main/common/utils/dateUtils';
import {Party} from '../../../../../main/common/models/party';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;

const claim = new Claim();
claim.claimantResponse = new ClaimantResponse();
claim.respondent1 = new Party();

describe('Full Admit Set Date Payment Service', () => {
  describe('getFullAdmitSetDatePaymentDetails', () => {
    it('should return object with correct details', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        claim.respondent1.partyName = 'John Doe';
        claim.paymentDate = new Date('2022-11-11T13:29:22.447');
        claim.claimantResponse.fullAdmitSetDateAcceptPayment = {
          option: YesNo.YES,
        };
        return claim;
      });

      //When
      const details = await getFullAdmitSetDatePaymentDetails('validClaimId');

      //Then
      expect(details.fullAdmitAcceptPayment.option).toBe(YesNo.YES);
      expect(details.defendantName).toBe(claim.getDefendantName());
      expect(details.proposedSetDate).toBe(formatDateToFullDate(claim.paymentDate));
    });

    it('should return object when option is undefined', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        claim.respondent1.partyName = 'John Doe';
        claim.paymentDate = new Date('2022-11-11T13:29:22.447');
        claim.claimantResponse.fullAdmitSetDateAcceptPayment = undefined;
        return claim;
      });

      //When
      const details = await getFullAdmitSetDatePaymentDetails('validClaimId');

      //Then
      expect(details.fullAdmitAcceptPayment).toBeUndefined();
      expect(details.defendantName).toBe(claim.getDefendantName());
      expect(details.proposedSetDate).toBe(formatDateToFullDate(claim.paymentDate));
    });

    it('should return an error on redis failure', async () => {
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

      await expect(getFullAdmitSetDatePaymentDetails('claimId')).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
