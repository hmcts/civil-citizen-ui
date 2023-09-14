const I = actor();
const config = require('../../../../config');

class EligibilityCheck {
  async open() {
    await I.amOnPage('/eligibility');
    await I.waitForText('Try the new online service', config.WaitForText);
    await I.see('We are building a new service. Different designs are being tested and changed based on feedback from users.');
    await I.see('You will be asked some questions to check you are eligible to use this service.');
    await I.see('Contact us for help');
    await I.click('Continue');
  }

  async eligibilityClaimValue(){
    await I.waitForText('Total amount you\'re claiming');
    await I.see('If you\'re claiming interest, include that in the amount');
    await I.see('Over £25,000');
    await I.see('£25,000 or less');
    await I.see('I don\'t know the amount');
  }
}

module.exports = EligibilityCheck;
