const I = actor();
const config = require('../../../../../../config');
const ContactUs = require('../../../../common/contactUs');
const contactUs = new ContactUs();

const fields = {
  altEmailAddressTextField: 'input[id="alternativeEmailAddress"]',
  noButton: 'input[value="no"]',
};

class AlternativeEmail {

  async confirmAltEmail() {
    await I.waitForText('Can the mediation team use', config.WaitForText);
    await I.click(fields.noButton);
    contactUs.verifyContactUs();
    await I.click('Save and continue');
    await I.waitForText('Please provide an alternative email address', config.WaitForText);
    await I.click('Save and continue');
    await I.see('Enter a valid email address');
    await I.fillField(fields.altEmailAddressTextField, 'test@gmail.com');
    contactUs.verifyContactUs();
    await I.click('Save and continue');
  }
}

module.exports = AlternativeEmail;
