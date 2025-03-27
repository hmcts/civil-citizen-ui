const I = actor();
const config = require('../../../../../../config');
const ContactUs = require('../../../../common/contactUs');
const sharedData = require('../../../../../sharedData');

const contactUs = new ContactUs();

const fields = {
  altPhoneTextField: 'input[id="alternativeTelephone"]',
  yesButton: 'input[value="yes"]',
  noButton: 'input[value="no"]',
  availabilityForMediationLink: 'a[href*="phone-confirmation"]',
};

const content = {
  phoneMustBeUKNum: {
    en: 'Phone number must be a UK number',
    cy: 'Rhaid i’r rhif ffôn fod yn rhif yn y DU',
  },
  canMediatorUse: {
    en: 'Can the mediator use',
    cy: 'A all y cyfryngwr ddefnyddio',
  },
  saveAndCotinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau',
  },
  choseYesNo: {
    en: 'Choose option: Yes or No',
    cy: 'Dewiswch opsiwn: Gallai neu Na allai',
  },
  enterAltNum: {
    en: 'Please provide an alternative number',
    cy: 'Nodwch rif ffôn arall',
  },
  enterPhoneNum: {
    en: 'Please enter a phone number',
    cy: 'Nodwch rif ffôn',
  },
};

class PhoneConfirmation {

  async goToPhoneDetailsScreen() {
    await I.forceClick(fields.availabilityForMediationLink);
  }

  async enterPhoneDetails() {
    I.waitForContent('Can the mediator use ', config.WaitForText);
    I.click('Save and continue');
    I.see('Choose option: Yes or No');
    I.click(fields.yesButton);
    contactUs.verifyContactUs();
    await I.click('Save and continue');
  }

  async enterAltPhoneDetails() {
    const { language } = sharedData;
    I.forceClick(fields.availabilityForMediationLink);
    await I.waitForContent(content.canMediatorUse[language], config.WaitForText);
    await I.click(content.saveAndCotinue[language]);
    await I.see(content.choseYesNo[language]);
    await I.click(fields.noButton);
    await contactUs.verifyContactUs(language);
    await I.click(content.saveAndCotinue[language]);
    await I.see(content.enterAltNum[language]);
    await I.click(content.saveAndCotinue[language]);
    await I.see(content.enterPhoneNum[language]);
    I.fillField(fields.altPhoneTextField, 'test@gmail.com');
    await I.click(content.saveAndCotinue[language]);
    await I.see(content.phoneMustBeUKNum[language]);
    I.fillField(fields.altPhoneTextField, '07446778100');
    await contactUs.verifyContactUs(language);
    await I.click(content.saveAndCotinue[language]);
  }
}

module.exports = PhoneConfirmation;
