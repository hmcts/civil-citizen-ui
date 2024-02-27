const PayHearingFee = require('../pages/hearingFee/payHearingFee');
const ApplyHelpFeeSelection = require('../pages/hearingFee/applyHelpFeeSelection');
const ApplyHelpFees = require ('../pages/hearingFee/applyHelpWithFees');
const ApplyHelpWithFeesStart = require ('../pages/hearingFee/applyHelpWithFeesStart');
const ApplyHelpWithFeesReferenceNumber = require ('../pages/hearingFee/applyHelpWithFeesReferenceNumber');
const ApplyHelpWithFeesConfirmation = require ('../pages/hearingFee/applyHelpWithFeesConfirmation');
const PaymentSuccessful = require ('../pages/hearingFee/paymentSuccessful');
const GovPay = require ('../../common/govPay');

const I = actor(); // eslint-disable-line no-unused-vars
const payHearingFee = new PayHearingFee();
const applyHelpFeeSelection = new ApplyHelpFeeSelection();
const applyHelpFees = new ApplyHelpFees();
const applyHelpWithFeesStart = new ApplyHelpWithFeesStart();
const applyHelpWithFeesReferenceNumber = new ApplyHelpWithFeesReferenceNumber();
const applyHelpWithFeesConfirmation = new ApplyHelpWithFeesConfirmation();
const paymentSuccessful = new PaymentSuccessful();
const govPay = new GovPay();

class hearingFeeSteps {

  initiateApplyForHelpWithFeesJourney(claimRef, feeAmount, dueDate) {
    console.log('The value of the Claim Reference : ' + claimRef);
    payHearingFee.open(claimRef);
    payHearingFee.verifyPageContent(feeAmount, dueDate);
    payHearingFee.nextAction('Start now');
    applyHelpFeeSelection.verifyPageContent(feeAmount);
    applyHelpFeeSelection.nextAction('Yes');
    applyHelpFeeSelection.nextAction('Continue');
    applyHelpFees.verifyPageContent(feeAmount);
    applyHelpFees.nextAction('Yes');
    applyHelpFees.nextAction('Continue');
    applyHelpWithFeesStart.verifyPageContent();
    applyHelpWithFeesStart.nextAction('Continue');
    applyHelpWithFeesReferenceNumber.verifyPageContent();
    applyHelpWithFeesReferenceNumber.nextAction('Yes');
    applyHelpWithFeesReferenceNumber.addHelpWithFeesReference();
    applyHelpWithFeesReferenceNumber.nextAction('Continue');
    applyHelpWithFeesConfirmation.verifyPageContent();
  }

  payHearingFeeJourney(claimRef, feeAmount, dueDate) {
    console.log('The value of the Claim Reference : ' + claimRef);
    payHearingFee.open(claimRef);
    payHearingFee.verifyPageContent(feeAmount, dueDate);
    payHearingFee.nextAction('Start now');
    applyHelpFeeSelection.verifyPageContent(feeAmount);
    applyHelpFeeSelection.nextAction('No');
    applyHelpFeeSelection.nextAction('Continue');
    govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();
    paymentSuccessful.verifyPageContent(feeAmount);
  }
}

module.exports = new hearingFeeSteps();
