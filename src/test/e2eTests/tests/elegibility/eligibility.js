const config = require('../../../config');
const Eligibility = require('../../createClaim/steps/eligibility');
const {notEligibleReason, eligibleCheckBoxValue, yesAndNoCheckBoxOptionValue} = require('../../commons/eligibleVariables');
Feature('Eligibility Journey').tag('@e2e');

Scenario('I don`t know the amount', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    Eligibility.start();
    Eligibility.ClaimValue(eligibleCheckBoxValue.I_DONT_KNOW_THE_AMOUNT);
    Eligibility.OpenNotEligible(notEligibleReason.CLAIM_VALUE_NOT_KNOWN);
  }
});

Scenario('Over £25,000', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    Eligibility.start();
    Eligibility.ClaimValue(eligibleCheckBoxValue.OVER_25000);
    Eligibility.OpenNotEligible(notEligibleReason.CLAIM_VALUE_OVER_25000);
  }
});

Scenario('£25,000 or less and claim is against more than one person or organization', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    Eligibility.start();
    Eligibility.ClaimValue(eligibleCheckBoxValue.LESS_OR_25000);
    Eligibility.singleDefendant(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.OpenNotEligible(notEligibleReason.MULTIPLE_DEFENDANTS);
  }
});

Scenario('£25,000 or less and claim is only one person or organization', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    Eligibility.start();
    Eligibility.ClaimValue(eligibleCheckBoxValue.LESS_OR_25000);
    Eligibility.singleDefendant(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.defendantAddress();

  }
});
