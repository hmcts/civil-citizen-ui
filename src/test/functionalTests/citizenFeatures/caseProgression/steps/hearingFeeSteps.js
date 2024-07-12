const PayHearingFee = require('../pages/hearingFee/payHearingFee');
const ApplyHelpFeeSelection = require('../pages/hearingFee/applyHelpFeeSelection');
const ApplyHelpFees = require ('../pages/hearingFee/applyHelpWithFees');
const ApplyHelpWithFeesStart = require ('../pages/hearingFee/applyHelpWithFeesStart');
const ApplyHelpWithFeesReferenceNumber = require ('../pages/hearingFee/applyHelpWithFeesReferenceNumber');
const ApplyHelpWithFeesConfirmation = require ('../pages/hearingFee/applyHelpWithFeesConfirmation');
const PaymentSuccessful = require ('../pages/hearingFee/paymentSuccessful');
const GovPay = require ('../../common/govPay');
const {waitForFinishedBusinessProcess} = require('../../../specClaimHelpers/api/steps');
const { isDashboardServiceToggleEnabled } = require('../../../specClaimHelpers/api/testingSupport');

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

  async initiateApplyForHelpWithFeesJourney(claimRef, feeAmount, dueDate, caseNumber, claimAmount) {
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    if (!isDashboardServiceEnabled) {
      console.log('The value of the Claim Reference : ' + claimRef);
      payHearingFee.open(claimRef);
      payHearingFee.verifyPageContent(feeAmount, dueDate, caseNumber, claimAmount);
      payHearingFee.nextAction('Start now');
      applyHelpFeeSelection.verifyPageContent(caseNumber, claimAmount);
      applyHelpFeeSelection.nextAction('Yes');
      applyHelpFeeSelection.nextAction('Continue');
      applyHelpFees.verifyPageContent(feeAmount, caseNumber, claimAmount);
      applyHelpFees.nextAction('Yes');
      applyHelpFees.nextAction('Continue');
    }
    applyHelpWithFeesStart.verifyPageContent(caseNumber, claimAmount);
    applyHelpWithFeesStart.nextAction('Continue');
    applyHelpWithFeesReferenceNumber.verifyPageContent(caseNumber, claimAmount);
    applyHelpWithFeesReferenceNumber.nextAction('Yes');
    applyHelpWithFeesReferenceNumber.addHelpWithFeesReference();
    applyHelpWithFeesReferenceNumber.nextAction('Continue');
    applyHelpWithFeesConfirmation.verifyPageContent();
    applyHelpWithFeesConfirmation.nextAction('Close and return to case overview');
    await waitForFinishedBusinessProcess();
  }

  async payHearingFeeJourney(claimRef, feeAmount, dueDate, caseNumber, claimAmount) {
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    if (!isDashboardServiceEnabled) {
      console.log('The value of the Claim Reference : ' + claimRef);
      payHearingFee.open(claimRef);
      payHearingFee.verifyPageContent(feeAmount, dueDate, caseNumber, claimAmount);
      payHearingFee.nextAction('Start now');
      applyHelpFeeSelection.verifyPageContent(caseNumber, claimAmount);
      applyHelpFeeSelection.nextAction('No');
      applyHelpFeeSelection.nextAction('Continue');
    }
    await govPay.addValidCardDetails(feeAmount);
    govPay.confirmPayment();
    paymentSuccessful.verifyPageContent(feeAmount);
    paymentSuccessful.nextAction('Close and return to case overview');
  }
}

module.exports = new hearingFeeSteps();
