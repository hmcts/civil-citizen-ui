const {clickButton} = require('../../commons/clickButton');
const {buttonType} = require('../../commons/buttonVariables');
const I = actor();

class Eligibility {
  start() {
    I.amOnPage('/eligibility');
    clickButton(buttonType.CONTINUE);
  }

  ClaimValue(optionValue) {
    I.amOnPage('/eligibility/claim-value');
    I.checkOption(`#${optionValue}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  OpenNotEligible(notEligibleReason){
    I.seeInCurrentUrl(`/not-eligible?reason=${notEligibleReason}`);
  }

  singleDefendant(optionValue) {
    I.seeInCurrentUrl('/eligibility/single-defendant');
    I.checkOption(`#${optionValue}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  defendantAddress(optionValue) {
    I.seeInCurrentUrl('/eligibility/defendant-address');
    I.checkOption(`#${optionValue}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  claimType(optionValue) {
    I.seeInCurrentUrl('/eligibility/claim-type');
    I.checkOption(`#${optionValue}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  claimantAddress(optionValue) {
    I.seeInCurrentUrl('/eligibility/claimant-address');
    I.checkOption(`#${optionValue}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  claimIsForTenancyDeposit(optionValue) {
    I.seeInCurrentUrl('/eligibility/claim-is-for-tenancy-deposit');
    I.checkOption(`#${optionValue}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  governmentDepartment(optionValue) {
    I.seeInCurrentUrl('/eligibility/government-department');
    I.checkOption(`#${optionValue}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  defendantAge(optionValue) {
    I.seeInCurrentUrl('/eligibility/defendant-age');
    I.checkOption(`#${optionValue}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  over18(optionValue) {
    I.seeInCurrentUrl('/eligibility/over-18');
    I.checkOption(`#${optionValue}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  helpWithFees(optionValue) {
    I.seeInCurrentUrl('/eligibility/help-with-fees');
    I.checkOption(`#${optionValue}`);
    clickButton(buttonType.SAVE_AND_CONTINUE);
  }

  eligible() {
    I.seeInCurrentUrl('/eligibility/eligible');
    clickButton(buttonType.CONTINUE);
  }

}

module.exports = new Eligibility();
