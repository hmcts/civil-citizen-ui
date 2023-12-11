const I = actor();
const config = require('../../../../../../config');
const ContactUs = require('../../../../common/contactUs');

const contactUs = new ContactUs();

const fields = {
  yesButton: 'input[value="yes"]',
  availabilityForMediationLink: 'a[href*="mediation-contact-person"]',
};

class ContactPerson {

  async confirmContactPerson() {
    await I.forceClick(fields.availabilityForMediationLink);
    await I.waitForText('who will be attending the mediation appointment?', config.WaitForText);
    contactUs.verifyContactUs();
    await I.click('Save and continue');
    await I.see('Choose option: Yes or No');
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = ContactPerson;
