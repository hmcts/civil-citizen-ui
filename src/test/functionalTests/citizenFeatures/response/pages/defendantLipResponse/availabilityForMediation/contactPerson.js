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
    await I.forceClick(fields.availabilityForMediationLink);
    await I.waitForContent('Is Test Company the person who will be attending ' +
        'the mediation appointment?', config.WaitForText);
    contactUs.verifyContactUs();
    await I.click('Save and continue');
    await I.see('Choose option: Yes or No');
    await I.click(fields.noButton);
    await I.click('Save and continue');
    await I.waitForContent('Please provide the name of your nominated ' +
        'person to contact', config.WaitForText);
    contactUs.verifyContactUs();
    await I.fillField(fields.alternativeContactPerson, 'test 123');
    await I.click('Save and continue');
  }
}

module.exports = ContactPerson;
