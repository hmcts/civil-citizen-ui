const I = actor();

class Eligibility {
  start() {
    I.amOnPage('/eligibility');
    I.click('Continue');
  }

  ClaimValue(optionValue) {
    I.seeInCurrentUrl('/eligibility/claim-value');
    I.checkOption(`#${optionValue}`);
    I.click('Save and continue');
  }

  OpenNotEligible(notEligibleReason){
    I.seeInCurrentUrl(`/not-eligible?reason=${notEligibleReason}`);
  }

}

module.exports = new Eligibility();
