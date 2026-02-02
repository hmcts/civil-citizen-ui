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
    await I.see('Select if the mediation team can contact you on [email] about your mediation appointment or not');
    await I.click(fields.yesButton);
    contactUs.verifyContactUs();
    await I.click('Save and continue');
  }
}

module.exports = EmailConfirmation;
