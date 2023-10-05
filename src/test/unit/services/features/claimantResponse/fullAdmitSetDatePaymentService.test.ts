import {
  getSetDatePaymentDetails,
} from 'services/features/claimantResponse/fullAdmitSetDatePaymentService';
import {Claim} from 'common/models/claim';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {YesNo} from 'common/form/models/yesNo';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Party} from 'common/models/party';
import {PartyDetails} from 'common/form/models/partyDetails';
import {FullAdmission} from 'common/models/fullAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';

const claim = new Claim();
claim.claimantResponse = new ClaimantResponse();
claim.respondent1 = new Party();
claim.respondent1.partyDetails = new PartyDetails({});
claim.fullAdmission = new FullAdmission();
claim.fullAdmission.paymentIntention = new PaymentIntention();

describe('Full Admit Set Date Payment Service', () => {
  describe('getSetDatePaymentDetails', () => {
    it('should return object with correct details', async () => {
      //Given
      claim.respondent1.partyDetails.partyName = 'John Doe';
      claim.fullAdmission.paymentIntention.paymentDate = new Date('2022-11-11T13:29:22.447');
      claim.claimantResponse.fullAdmitSetDateAcceptPayment = {
        option: YesNo.YES,
      };
      //When
      const details = await getSetDatePaymentDetails(claim);

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
      const details = await getSetDatePaymentDetails(claim);

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
      const details = await getSetDatePaymentDetails(claim);

      //Then
      expect(details.fullAdmitAcceptPayment).toBeUndefined();
      expect(details.defendantName).toBe(claim.getDefendantFullName());
      expect(details.proposedSetDate).toBe(formatDateToFullDate(claim.fullAdmission.paymentIntention.paymentDate));
    });
  });
});
