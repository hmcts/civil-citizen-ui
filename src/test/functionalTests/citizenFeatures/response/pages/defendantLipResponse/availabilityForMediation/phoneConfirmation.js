const I = actor();
const config = require('../../../../../../config');
const ContactUs = require('../../../../common/contactUs');

const contactUs = new ContactUs();

const fields = {
  altPhoneTextField: 'input[id="alternativeTelephone"]',
  yesButton: 'input[value="yes"]',
  noButton: 'input[value="no"]',
  availabilityForMediationLink: 'a[href*="phone-confirmation"]',
};

class PhoneConfirmation {

  async enterPhoneDetails() {
    await I.forceClick(fields.availabilityForMediationLink);
    I.waitForContent('Can the mediator use ', config.WaitForText);
    I.click('Save and continue');
    I.see('Choose option: Yes or No');
    I.click(fields.yesButton);
    contactUs.verifyContactUs();
    I.click('Save and continue');
  }

  async enterAltPhoneDetails() {
    I.forceClick(fields.availabilityForMediationLink);
    await I.waitForContent('Can the mediator use ', config.WaitForText);
    await I.click('Save and continue');
    await I.see('Choose option: Yes or No');
    await I.click(fields.noButton);
    contactUs.verifyContactUs();
    await I.click('Save and continue');
    await I.see('Please provide an alternative number');
    await I.click('Save and continue');
    await I.see('Please enter a phone number');
    I.fillField(fields.altPhoneTextField, 'test@gmail.com');
    await I.click('Save and continue');
    await I.see('Phone number must be a UK number');
    I.fillField(fields.altPhoneTextField, '07446778100');
    contactUs.verifyContactUs();
    await I.click('Save and continue');
  }
}

module.exports = PhoneConfirmation;
