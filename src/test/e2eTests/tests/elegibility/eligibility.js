const config = require('../../../config');
const Eligibility = require('../../createClaim/steps/eligibility');
const {notEligibleReason, eligibleCheckBoxValue, yesAndNoCheckBoxOptionValue, claimTypeValue, defendantAgeCheckBoxValue} = require('../../commons/eligibleVariables');
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

Scenario('£25,000 or less and claim is not against more than one person or organization and is not in England or Wales', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    Eligibility.start();
    Eligibility.ClaimValue(eligibleCheckBoxValue.LESS_OR_25000);
    Eligibility.singleDefendant(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.defendantAddress(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.OpenNotEligible(notEligibleReason.DEFENDANT_ADDRESS);
  }
});

Scenario('£25,000 or less and claim is not against more than one person or organization and is in England or Wales and More than one person or organisation', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    Eligibility.start();
    Eligibility.ClaimValue(eligibleCheckBoxValue.LESS_OR_25000);
    Eligibility.singleDefendant(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.defendantAddress(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.claimType(claimTypeValue.MORE_THAN_ONE_PERSON_OR_ORGANISATION);
    Eligibility.OpenNotEligible(notEligibleReason.MULTIPLE_CLAIMANTS);
  }
});

Scenario('£25,000 or less and claim is not against more than one person or organization and is in England or Wales and A client - I`m their solicitor', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    Eligibility.start();
    Eligibility.ClaimValue(eligibleCheckBoxValue.LESS_OR_25000);
    Eligibility.singleDefendant(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.defendantAddress(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.claimType(claimTypeValue.MORE_THAN_ONE_PERSON_OR_ORGANISATION);
    Eligibility.OpenNotEligible(notEligibleReason.CLAIM_ON_BEHALF);
  }
});

Scenario('£25,000 or less and claim is not against more than one person or organization and is in England or Wales and A client - I`m their solicitor and claimant doesn`t have Uk post code', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    Eligibility.start();
    Eligibility.ClaimValue(eligibleCheckBoxValue.LESS_OR_25000);
    Eligibility.singleDefendant(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.defendantAddress(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.claimType(claimTypeValue.JUST_MY_SELF_OR_MY_ORGANISATION);
    Eligibility.claimantAddress(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.OpenNotEligible(notEligibleReason.CLAIMANT_ADDRESS);
  }
});

Scenario('£25,000 or less and claim is not against more than one person or organization and is in England or Wales and A client - I`m their solicitor and claimant does have Uk post code and yes for Is your claim for a tenancy deposit?', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    Eligibility.start();
    Eligibility.ClaimValue(eligibleCheckBoxValue.LESS_OR_25000);
    Eligibility.singleDefendant(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.defendantAddress(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.claimType(claimTypeValue.JUST_MY_SELF_OR_MY_ORGANISATION);
    Eligibility.claimantAddress(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.claimIsForTenancyDeposit(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.OpenNotEligible(notEligibleReason.CLAIM_IS_FOR_TENANCY_DEPOSIT);
  }
});

Scenario('£25,000 or less and claim is not against more than one person or organization and is in England or Wales and A client - I`m their solicitor and claimant does have Uk post code and no for Is your claim for a tenancy deposit? and yes for Are you claiming against a government department?', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    Eligibility.start();
    Eligibility.ClaimValue(eligibleCheckBoxValue.LESS_OR_25000);
    Eligibility.singleDefendant(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.defendantAddress(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.claimType(claimTypeValue.JUST_MY_SELF_OR_MY_ORGANISATION);
    Eligibility.claimantAddress(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.claimIsForTenancyDeposit(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.OpenNotEligible(notEligibleReason.CLAIM_IS_FOR_TENANCY_DEPOSIT);
    Eligibility.governmentDepartment(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.OpenNotEligible(notEligibleReason.GOVERNMENT_DEPARTMENT);
  }
});

Scenario('£25,000 or less and claim is not against more than one person or organization and is in England or Wales and A client - I`m their solicitor and claimant does have Uk post code and no for Is your claim for a tenancy deposit? and No for Are you claiming against a government department? and No for Do you believe the person you’re claiming against is 18 or over?', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    Eligibility.start();
    Eligibility.ClaimValue(eligibleCheckBoxValue.LESS_OR_25000);
    Eligibility.singleDefendant(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.defendantAddress(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.claimType(claimTypeValue.JUST_MY_SELF_OR_MY_ORGANISATION);
    Eligibility.claimantAddress(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.claimIsForTenancyDeposit(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.OpenNotEligible(notEligibleReason.CLAIM_IS_FOR_TENANCY_DEPOSIT);
    Eligibility.governmentDepartment(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.defendantAge(defendantAgeCheckBoxValue.NO);
    Eligibility.OpenNotEligible(notEligibleReason.UNDER_18_DEFENDANT);
  }
});

Scenario('£25,000 or less and claim is not against more than one person or organization and is in England or Wales and A client - I`m their solicitor and claimant does have Uk post code and no for Is your claim for a tenancy deposit? and No for Are you claiming against a government department? and Yes for Do you believe the person you’re claiming against is 18 or over? and No For Are you 18 or over?', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    Eligibility.start();
    Eligibility.ClaimValue(eligibleCheckBoxValue.LESS_OR_25000);
    Eligibility.singleDefendant(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.defendantAddress(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.claimType(claimTypeValue.JUST_MY_SELF_OR_MY_ORGANISATION);
    Eligibility.claimantAddress(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.claimIsForTenancyDeposit(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.OpenNotEligible(notEligibleReason.CLAIM_IS_FOR_TENANCY_DEPOSIT);
    Eligibility.governmentDepartment(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.defendantAge(defendantAgeCheckBoxValue.YES);
    Eligibility.over18(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.OpenNotEligible(notEligibleReason.UNDER_18);
  }
});

Scenario('£25,000 or less and claim is not against more than one person or organization and is in England or Wales and A client - I`m their solicitor and claimant does have Uk post code and no for Is your claim for a tenancy deposit? and No for Are you claiming against a government department? and Yes for Do you believe the person you’re claiming against is 18 or over? and Yes For Are you 18 or over? and Yes for Do you need help paying your court fee?', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    Eligibility.start();
    Eligibility.ClaimValue(eligibleCheckBoxValue.LESS_OR_25000);
    Eligibility.singleDefendant(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.defendantAddress(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.claimType(claimTypeValue.JUST_MY_SELF_OR_MY_ORGANISATION);
    Eligibility.claimantAddress(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.claimIsForTenancyDeposit(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.OpenNotEligible(notEligibleReason.CLAIM_IS_FOR_TENANCY_DEPOSIT);
    Eligibility.governmentDepartment(yesAndNoCheckBoxOptionValue.NO);
    Eligibility.defendantAge(defendantAgeCheckBoxValue.YES);
    Eligibility.over18(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.helpWithFees(yesAndNoCheckBoxOptionValue.YES);
    //help with fees journey
    Eligibility.informationAboutHelpWithFees(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.applyForHelpWithFees(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.helpWithFeesReference(yesAndNoCheckBoxOptionValue.YES);
    Eligibility.hwfEligibleReference(yesAndNoCheckBoxOptionValue.YES);
  }
});
