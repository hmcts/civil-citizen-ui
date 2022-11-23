import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {
  getFullAdmitSetDatePaymentDetails,
} from 'services/features/claimantResponse/fullAdmitSetDatePaymentService';
import {Claim} from 'common/models/claim';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {YesNo} from 'common/form/models/yesNo';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Party} from 'common/models/party';
import {PartyDetails} from 'common/form/models/partyDetails';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');

const mockGetCaseDataFromDraftStore = draftStoreService.getCaseDataFromStore as jest.Mock;

const claim = new Claim();
claim.claimantResponse = new ClaimantResponse();
claim.respondent1 = new Party();
claim.respondent1.partyDetails = new PartyDetails({});

describe('Full Admit Set Date Payment Service', () => {
  describe('getFullAdmitSetDatePaymentDetails', () => {
    it('should return object with correct details', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        claim.respondent1.partyDetails.partyName = 'John Doe';
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
      expect(details.defendantName).toBe(claim.getDefendantFullName());
      expect(details.proposedSetDate).toBe(formatDateToFullDate(claim.paymentDate));
    });

    it('should return object when claimantResponse is undefined', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        claim.respondent1.partyDetails.partyName = 'John Doe';
        claim.paymentDate = new Date('2022-11-11T13:29:22.447');
        claim.claimantResponse = undefined;
        return claim;
      });

      //When
      const details = await getFullAdmitSetDatePaymentDetails('validClaimId');

      //Then
      expect(details.fullAdmitAcceptPayment).toBeUndefined();
      expect(details.defendantName).toBe(claim.getDefendantFullName());
      expect(details.proposedSetDate).toBe(formatDateToFullDate(claim.paymentDate));
    });

    it('should return object when fullAdmitSetDateAcceptPayment is undefined', async () => {
      //Given
      mockGetCaseDataFromDraftStore.mockImplementation(async () => {
        claim.respondent1.partyDetails.partyName = 'John Doe';
        claim.paymentDate = new Date('2022-11-11T13:29:22.447');
        claim.claimantResponse = new ClaimantResponse();
        claim.claimantResponse.fullAdmitSetDateAcceptPayment = undefined;
        return claim;
      });

      //When
      const details = await getFullAdmitSetDatePaymentDetails('validClaimId');

      //Then
      expect(details.fullAdmitAcceptPayment).toBeUndefined();
      expect(details.defendantName).toBe(claim.getDefendantFullName());
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
