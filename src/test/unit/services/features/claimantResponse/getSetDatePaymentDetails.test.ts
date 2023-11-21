import {
  getSetDatePaymentDetails,
} from 'services/features/claimantResponse/getSetDatePaymentDetails';
import {Claim} from 'common/models/claim';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {YesNo} from 'common/form/models/yesNo';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Party} from 'common/models/party';
import {PartyDetailsCARM} from 'form/models/partyDetails-CARM';
import {FullAdmission} from 'common/models/fullAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {ResponseType} from 'common/form/models/responseType';
import {PartialAdmission} from 'common/models/partialAdmission';

const claim = new Claim();
claim.claimantResponse = new ClaimantResponse();
claim.respondent1 = new Party();
claim.respondent1.partyDetails = new PartyDetailsCARM({});
claim.fullAdmission = new FullAdmission();
claim.fullAdmission.paymentIntention = new PaymentIntention();
claim.partialAdmission = new PartialAdmission();
claim.partialAdmission.paymentIntention = new PaymentIntention();

describe('Full Admit Set Date Payment Service', () => {
  describe('getSetDatePaymentDetails', () => {
    it('should return object with correct details', async () => {
      //Given
      claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
      claim.respondent1.partyDetails.partyName = 'John Doe';
      claim.fullAdmission.paymentIntention.paymentDate = new Date('2022-11-11T13:29:22.447');
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = {
        option: YesNo.YES,
      };
      //When
      const details = getSetDatePaymentDetails(claim);

      //Then
      expect(details.fullAdmitAcceptPayment.option).toBe(YesNo.YES);
      expect(details.defendantName).toBe(claim.getDefendantFullName());
      expect(details.proposedSetDate).toBe(formatDateToFullDate(claim.fullAdmission.paymentIntention.paymentDate));
    });

    it('should return object when claimantResponse is undefined', async () => {
      //Given
      claim.respondent1.partyDetails.partyName = 'John Doe';
      claim.fullAdmission.paymentIntention.paymentDate = new Date('2022-11-11T13:29:22.447');
      claim.claimantResponse = undefined;

      //When
      const details = getSetDatePaymentDetails(claim);

      //Then
      expect(details.fullAdmitAcceptPayment).toBeUndefined();
      expect(details.defendantName).toBe(claim.getDefendantFullName());
      expect(details.proposedSetDate).toBe(formatDateToFullDate(claim.fullAdmission.paymentIntention.paymentDate));
    });

    it('should return object when getSetDatePaymentDetails is undefined', async () => {
      //Given
      claim.respondent1.partyDetails.partyName = 'John Doe';
      claim.fullAdmission.paymentIntention.paymentDate = new Date('2022-11-11T13:29:22.447');
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = undefined;

      //When
      const details = getSetDatePaymentDetails(claim);

      //Then
      expect(details.fullAdmitAcceptPayment).toBeUndefined();
      expect(details.defendantName).toBe(claim.getDefendantFullName());
      expect(details.proposedSetDate).toBe(formatDateToFullDate(claim.fullAdmission.paymentIntention.paymentDate));
    });

    it('should return object with correct details for partial admission', async () => {
      // Given
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      claim.respondent1.partyDetails.partyName = 'John Doe';
      claim.partialAdmission.paymentIntention.paymentDate = new Date('2022-11-11T13:29:22.447');
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = {
        option: YesNo.YES,
      };

      // When
      const details = getSetDatePaymentDetails(claim);

      // Then
      expect(details.fullAdmitAcceptPayment.option).toBe(YesNo.YES);
      expect(details.defendantName).toBe(claim.getDefendantFullName());
      expect(details.proposedSetDate).toBe(formatDateToFullDate(claim.partialAdmission.paymentIntention.paymentDate));
    });

    it('should return object when claimantResponse is undefined for partial admission', async () => {
      // Given
      claim.respondent1.partyDetails.partyName = 'John Doe';
      claim.partialAdmission.paymentIntention.paymentDate = new Date('2022-11-11T13:29:22.447');
      claim.claimantResponse = undefined;

      // When
      const details = getSetDatePaymentDetails(claim);

      // Then
      expect(details.fullAdmitAcceptPayment).toBeUndefined();
      expect(details.defendantName).toBe(claim.getDefendantFullName());
      expect(details.proposedSetDate).toBe(formatDateToFullDate(claim.partialAdmission.paymentIntention.paymentDate));
    });

    it('should return object when getSetDatePaymentDetails is undefined for partial admission', async () => {
      // Given
      claim.respondent1.partyDetails.partyName = 'John Doe';
      claim.partialAdmission.paymentIntention.paymentDate = new Date('2022-11-11T13:29:22.447');
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = undefined;

      // When
      const details = getSetDatePaymentDetails(claim);

      // Then
      expect(details.fullAdmitAcceptPayment).toBeUndefined();
      expect(details.defendantName).toBe(claim.getDefendantFullName());
      expect(details.proposedSetDate).toBe(formatDateToFullDate(claim.partialAdmission.paymentIntention.paymentDate));
    });

    it('should catch and throw an error', () => {
      // Given
      const claim = new Claim();
      const expectedError = new Error('Test error message');

      claim.getDefendantFullName = () => {
        throw expectedError;
      };

      claim.getPaymentIntention = () => null;

      try {
        // When
        getSetDatePaymentDetails(claim);

        expect(true).toBe(false);
      } catch (error) {
        // Then
        expect(error).toBe(expectedError);
      }
    });
  });
});

