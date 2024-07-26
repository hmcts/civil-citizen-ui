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
    I.waitForNavigation();
    I.seeInCurrentUrl(`/not-eligible?reason=${notEligibleReason}`);
  }

  singleDefendant(optionValue) {
    I.seeInCurrentUrl('/eligibility/single-defendant');
    I.checkOption(`#${optionValue}`);
    I.click('Save and continue');
  }

  defendantAddress(optionValue) {
    I.seeInCurrentUrl('/eligibility/defendant-address');
    I.checkOption(`#${optionValue}`);
    I.click('Save and continue');
  }
}

module.exports = new Eligibility();
