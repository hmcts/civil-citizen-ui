const I = actor();
const config = require('../../../../../../config');
const ContactUs = require('../../../../common/contactUs');

const contactUs = new ContactUs();

const fields = {
  yesButton: 'input[value="yes"]',
  noButton: 'input[value="no"]',
  availabilityForMediationLink: 'a[href*="mediation-contact-person"]',
  alternativeContactPerson: 'input[id="alternativeContactPerson"]',
};

class ContactPerson {

  async confirmContactPerson() {
    I.forceClick(fields.availabilityForMediationLink);
    I.waitForText('Is Test Company the person who will be attending ' +
        'the mediation appointment?', config.WaitForText);
    contactUs.verifyContactUs();
    I.click('Save and continue');
    I.see('Choose option: Yes or No');
    I.click(fields.noButton);
    I.click('Save and continue');
    I.waitForText('Please provide the name of your nominated ' +
        'person to contact', config.WaitForText);
    contactUs.verifyContactUs();
    I.fillField(fields.alternativeContactPerson, 'test 123');
    I.click('Save and continue');
  }
}

module.exports = ContactPerson;
