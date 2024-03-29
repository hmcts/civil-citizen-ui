const I = actor();
const config = require('../../../../../../config');
const ContactUs = require('../../../../common/contactUs');

const contactUs = new ContactUs();

const fields = {
  yesButton: 'input[value="yes"]',
};

class EmailConfirmation {

  async confirmEmail() {
    await I.waitForContent('Can the mediation team use', config.WaitForText);
    await I.click('Save and continue');
    await I.see('Choose option: Yes or No');
    await I.click(fields.yesButton);
    contactUs.verifyContactUs();
    await I.click('Save and continue');
  }
}

module.exports = EmailConfirmation;
