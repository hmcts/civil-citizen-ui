const I = actor();
const config = require('../../../../../../config');

const fields = {
  altEmailAddressTextField: 'input[id="alternativeEmailAddress"]',
};

class AlternativeEmail {

  async confirmAltEmail(claimRef) {
    await I.amOnPage('/case/' + claimRef + '/mediation/alternative-email');
    await I.waitForText('Please provide an alternative email address', config.WaitForText);
    await I.click('Save and continue');
    await I.see('Enter a valid email address');
    I.fillField(fields.altEmailAddressTextField, 'test@gmail.com');
    await I.click('Save and continue');
  }
}

module.exports = AlternativeEmail;
