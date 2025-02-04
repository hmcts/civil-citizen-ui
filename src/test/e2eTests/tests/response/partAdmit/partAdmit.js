const config = require('../../../../config');
const PartAdmit = require('../../../response/steps/response');
const {paymentType} = require('../../../commons/responseVariables');
const {yesAndNoCheckBoxOptionValue} = require('../../../commons/eligibleVariables');

Feature('Response journey defendant Part Admit').tag('@e2e');

Scenario('already paid', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449438';
    PartAdmit.start(claimId);
    PartAdmit.confirmYourDetails(claimId);
    PartAdmit.chooseResponsePartAdmitOfTheClaim(yesAndNoCheckBoxOptionValue.YES);
    PartAdmit.howMuchYouHavePaid();
    PartAdmit.whyDoYouDisagreeWithTheAmountClaimed();
    PartAdmit.freeTelephoneMediation();
    PartAdmit.giveUsDetailsInCaseThereIsAHearing();
    PartAdmit.checkAndSubmitYourResponse(true);
  }
});

Scenario('pay immediately', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449448';
    PartAdmit.start(claimId);
    PartAdmit.confirmYourDetails(claimId);
    PartAdmit.chooseResponsePartAdmitOfTheClaim(yesAndNoCheckBoxOptionValue.NO);
    PartAdmit.howMuchMoneyDoYouAdmitYouOwe();
    PartAdmit.whyDoYouDisagreeWithTheAmountClaimed();
    PartAdmit.whenWillYouPay(paymentType.IMMEDIATELY);
    PartAdmit.freeTelephoneMediation();
    PartAdmit.giveUsDetailsInCaseThereIsAHearing();
    PartAdmit.checkAndSubmitYourResponse(true);
  }
});

Scenario('By set date', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449458';
    PartAdmit.start(claimId);
    PartAdmit.confirmYourDetails(claimId);
    PartAdmit.chooseResponsePartAdmitOfTheClaim(yesAndNoCheckBoxOptionValue.NO);
    PartAdmit.howMuchMoneyDoYouAdmitYouOwe();
    PartAdmit.whyDoYouDisagreeWithTheAmountClaimed();
    PartAdmit.whenWillYouPay(paymentType.BY_A_SET_DATE);
    PartAdmit.shareYourFinancialDetails();
    PartAdmit.freeTelephoneMediation();
    PartAdmit.giveUsDetailsInCaseThereIsAHearing();
    PartAdmit.checkAndSubmitYourResponse(true);
  }
});

Scenario('I will suggest a repayment plan', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const claimId = '1645882162449468';
    PartAdmit.start(claimId);
    PartAdmit.confirmYourDetails(claimId);
    PartAdmit.chooseResponsePartAdmitOfTheClaim(yesAndNoCheckBoxOptionValue.NO);
    PartAdmit.howMuchMoneyDoYouAdmitYouOwe();
    PartAdmit.whyDoYouDisagreeWithTheAmountClaimed();
    PartAdmit.whenWillYouPay(paymentType.I_WILL_SUGGEST_A_REPAYMENT_PLAN);
    PartAdmit.shareYourFinancialDetails();
    PartAdmit.yourRepaymentPlan(true);
    PartAdmit.freeTelephoneMediation();
    PartAdmit.giveUsDetailsInCaseThereIsAHearing();
    PartAdmit.checkAndSubmitYourResponse(true);
  }
});
