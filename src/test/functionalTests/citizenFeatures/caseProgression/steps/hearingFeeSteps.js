const ApplyHelpWithFeesStart = require ('../pages/hearingFee/applyHelpWithFeesStart');
const ApplyHelpWithFeesReferenceNumber = require ('../pages/hearingFee/applyHelpWithFeesReferenceNumber');
const ApplyHelpWithFeesConfirmation = require ('../pages/hearingFee/applyHelpWithFeesConfirmation');
const PaymentSuccessful = require ('../pages/hearingFee/paymentSuccessful');
const GovPay = require ('../../common/govPay');
const {waitForFinishedBusinessProcess} = require('../../../specClaimHelpers/api/steps');

const I = actor(); // eslint-disable-line no-unused-vars
const applyHelpWithFeesStart = new ApplyHelpWithFeesStart();
const applyHelpWithFeesReferenceNumber = new ApplyHelpWithFeesReferenceNumber();
const applyHelpWithFeesConfirmation = new ApplyHelpWithFeesConfirmation();
const paymentSuccessful = new PaymentSuccessful();
const govPay = new GovPay();

class hearingFeeSteps {

  async initiateApplyForHelpWithFeesJourney(claimRef, feeAmount, dueDate, caseNumber, claimAmount) { 
    await applyHelpWithFeesStart.verifyPageContent(caseNumber, claimAmount);
    await applyHelpWithFeesStart.nextAction('Continue');
    await applyHelpWithFeesReferenceNumber.verifyPageContent(caseNumber, claimAmount);
    await applyHelpWithFeesReferenceNumber.nextAction('Yes');
    await applyHelpWithFeesReferenceNumber.addHelpWithFeesReference();
    await applyHelpWithFeesReferenceNumber.nextAction('Continue');
    await applyHelpWithFeesConfirmation.verifyPageContent();
    await applyHelpWithFeesConfirmation.nextAction('Go to your account');
    await waitForFinishedBusinessProcess();
  }

  async payHearingFeeJourney(feeAmount) {
    await govPay.addValidCardDetails(feeAmount);
    await govPay.confirmPayment();
    await paymentSuccessful.verifyPageContent(feeAmount);
    await paymentSuccessful.nextAction('Go to your account');
  }
}

module.exports = new hearingFeeSteps();
