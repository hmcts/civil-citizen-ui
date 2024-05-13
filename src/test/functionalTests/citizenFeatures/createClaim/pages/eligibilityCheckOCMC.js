const I = actor();

const fields = {
  over25000: '#totalAmount',
  lessthan25000: '#totalAmount-2',
  lessthan10000: '#claimValueUNDER_10000',
  dontKnowTheAmount: '#totalAmount-3',
  singleDefendantNo: '#singleDefendantno',
  defendantAddressYes: '#defendantAddressyes',
  claimTypeMyOrg: '#claimTypePERSONAL_CLAIM',
  claimantAddressYes: '#claimantAddressyes',
  tenancyDepositNo: '#claimIsForTenancyDepositno',
  govtDeptNo: '#governmentDepartmentno',
  defendantAge18: '#defendantAgeyes',
  claimantAge18: '#eighteenOrOveryes',
  hwfReferenceNo: '#helpWithFeesno',
};

class EligibilityCheckOCMC {
  async open() {
    await I.amOnPage('https://moneyclaims.aat.platform.hmcts.net/eligibility');
    await I.click('Continue');
  }

  async eligibilityClaimValue() {
    await I.click(fields.lessthan10000);
    await I.click('Save and continue');
  }

  async eligibilitySingleDefendant() {
    //await I.waitForText('Is this claim against more than one person or organisation?');
    await I.click(fields.singleDefendantNo);
    await I.click('Save and continue');
  }

  async eligibilityDefendantAddress() {
    //await I.waitForText('Does the person or organisation you’re claiming against have a postal address in England or Wales?');
    await I.click(fields.defendantAddressYes);
    await I.click('Save and continue');
  }

  async eligibilityClaimType() {
    //await I.waitForText('Who are you making the claim for?');
    await I.click(fields.claimTypeMyOrg);
    await I.click('Save and continue');
  }

  async eligibilityClaimantAddress() {
    //await I.waitForText('Do you have a postal address in the UK?');
    await I.click(fields.claimantAddressYes);
    await I.click('Save and continue');
  }

  async eligibilityTenancyDeposit() {
    //await I.waitForText('Is your claim for a tenancy deposit?');
    await I.click(fields.tenancyDepositNo);
    await I.click('Save and continue');
  }

  async eligibilityGovtDept() {
    //await I.waitForText('Are you claiming against a government department?');
    await I.click(fields.govtDeptNo);
    await I.click('Save and continue');
  }

  async eligibilityDefendantAge() {
    //await I.waitForText('Do you believe the person you’re claiming against is 18 or over?');
    await I.click(fields.defendantAge18);
    await I.click('Save and continue');
  }

  async eligibilityClaimantAge() {
    //await I.waitForText('Are you 18 or over?');
    await I.click(fields.claimantAge18);
    await I.click('Save and continue');
  }

  async eligibilityHWFReference() {
    //await I.waitForText('Do you have a Help With Fees reference number?');
    await I.click(fields.hwfReferenceNo);
    await I.click('Save and continue');
    await I.click('Continue');
  }

}

module.exports = EligibilityCheckOCMC;
