const I = actor();
const config = require('../../../../../../config');
const ContactUs = require('../../../../common/contactUs');

const contactUs = new ContactUs();

const fields = {
  yesButton: 'input[value="yes"]',
};

class ContactPerson {

  async confirmContactPerson(claimRef) {
    await I.amOnPage('/case/' + claimRef + '/mediation/mediation-contact-person');
    await I.waitForText('who will be attending the mediation appointment?', config.WaitForText);
    contactUs.verifyContactUs();
    await I.click('Save and continue');
    await I.see('Choose option: Yes or No');
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = ContactPerson;
