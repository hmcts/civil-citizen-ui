import {ClaimantResponse} from 'common/models/claimantResponse';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {Claim} from 'common/models/claim';
import {CCJRequest} from 'common/models/claimantResponse/ccj/ccjRequest';
import {DefendantDOB} from 'common/models/claimantResponse/ccj/defendantDOB';
import {PaidAmount} from 'common/models/claimantResponse/ccj/paidAmount';
import {QualifiedStatementOfTruth} from 'common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {YesNo} from 'common/form/models/yesNo';
import {CcjPaymentOption} from 'common/form/models/claimantResponse/ccj/ccjPaymentOption';
import {DateOfBirth} from 'common/models/claimantResponse/ccj/dateOfBirth';
import {PaymentDate} from 'common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {RepaymentPlanInstalments} from 'common/models/claimantResponse/ccj/repaymentPlanInstalments';
import {InstalmentFirstPaymentDate} from 'common/models/claimantResponse/ccj/instalmentFirstPaymentDate';
import {TransactionSchedule} from 'common/form/models/statementOfMeans/expensesAndIncome/transactionSchedule';

describe('ccjRequest model', () => {

  describe('isCCJCompleted', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim;
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.ccjRequest = new CCJRequest();
    });

    it('should return false', () => {
      //Then
      expect(claim.claimantResponse.ccjRequest.isCCJCompleted()).toBeFalsy();
    });
    
    it('should return true when paid by immediately', () => {
      //Given
      claim.claimantResponse.ccjRequest.defendantDOB = new DefendantDOB(YesNo.NO);
      claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.NO);
      claim.claimantResponse.ccjRequest.ccjPaymentOption = new CcjPaymentOption(PaymentOptionType.IMMEDIATELY);
      claim.claimantResponse.ccjRequest.statementOfTruth = new QualifiedStatementOfTruth(true);
      //Then
      expect(claim.claimantResponse.ccjRequest.isCCJCompleted()).toBeTruthy();
    });

    it('should return true when paid by set day', () => {
      //Given
      claim.claimantResponse.ccjRequest.defendantDOB = new DefendantDOB(YesNo.YES, new DateOfBirth({year:'1991', month:'1', day:'1'}));
      claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.YES, 10, 100);
      claim.claimantResponse.ccjRequest.ccjPaymentOption = new CcjPaymentOption(PaymentOptionType.BY_SET_DATE);
      claim.claimantResponse.ccjRequest.defendantPaymentDate = new PaymentDate('2000', '1', '1');
      claim.claimantResponse.ccjRequest.statementOfTruth = new QualifiedStatementOfTruth(true);
      //Then
      expect(claim.claimantResponse.ccjRequest.isCCJCompleted()).toBeTruthy();
    });

    it('should return true when paid by instalments', () => {
      //Given
      claim.claimantResponse.ccjRequest.defendantDOB = new DefendantDOB(YesNo.YES, new DateOfBirth({year:'1991', month:'1', day:'1'}));
      claim.claimantResponse.ccjRequest.paidAmount = new PaidAmount(YesNo.YES, 10, 100);
      claim.claimantResponse.ccjRequest.ccjPaymentOption = new CcjPaymentOption(PaymentOptionType.INSTALMENTS);
      claim.claimantResponse.ccjRequest.repaymentPlanInstalments =  new RepaymentPlanInstalments(
        '500', 
        new InstalmentFirstPaymentDate({year:'1991', month:'1', day:'1'}),
        TransactionSchedule.WEEK,
        10,
      );
      claim.claimantResponse.ccjRequest.statementOfTruth = new QualifiedStatementOfTruth(true);
      //Then
      expect(claim.claimantResponse.ccjRequest.isCCJCompleted()).toBeTruthy();
    });
  });
});
