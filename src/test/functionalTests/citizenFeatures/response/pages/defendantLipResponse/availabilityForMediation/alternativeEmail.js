const I = actor();
const config = require('../../../../../../config');
const ContactUs = require('../../../../common/contactUs');
const contactUs = new ContactUs();
const sharedData = require('../../../../../sharedData');

const fields = {
  altEmailAddressTextField: 'input[id="alternativeEmailAddress"]',
  noButton: 'input[value="no"]',
};

const content = {
  enterAltEmail: {
    en: 'Please provide an alternative email address',
    cy: 'Nodwch gyfeiriad e-bost arall',
  },
  enterValidEmail: {
    en: 'Enter a valid email address',
    cy: 'Nodwch gyfeiriad e-bost arall',
  },
  canMediatorUse: {
    en: 'Can the mediation team use',
    cy: 'A all y tîm cyfryngu ddefnyddio',
  },
  saveAndCotinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau',
  },
};

class AlternativeEmail {

  async confirmAltEmail() {
    const { language } = sharedData;
    await I.waitForContent(content.canMediatorUse[language], config.WaitForText);
    await I.click(fields.noButton);
    contactUs.verifyContactUs();
    await I.click(content.saveAndCotinue[language]);
    await I.waitForContent(content.enterAltEmail[language], config.WaitForText);
    await I.click(content.saveAndCotinue[language]);
    await I.see(content.enterValidEmail[language]);
    await I.fillField(fields.altEmailAddressTextField, 'test@gmail.com');
    contactUs.verifyContactUs();
    await I.click(content.saveAndCotinue[language]);
  }
}

module.exports = AlternativeEmail;
