const I = actor();
const config = require('../../../../../../config');

const fields = {
  contactNumber: 'input[id="telephoneNumber"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
};

const pageContent = {
  phoneNumberHeadingCarm: {
    en: 'Enter a phone number',
    cy: 'Rhowch rif ffôn' 
  },
  telephoneNunberHeadingCarm: {
    en: 'Enter telephone number',
    cy: '', //TODO
  },
  phoneNumberHeading: {
    en: 'Enter a phone number (optional)',
    cy: 'Rhowch rif ffôn (dewisol)'
  },
  saveAndContinueButtonText: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau',
  }
}

class ContactNumberDetailsPage {
  async enterContactNumber(carmEnabled = false, language = 'en') {
    if (carmEnabled) {
      await I.waitForText(pageContent.phoneNumberHeadingCarm[language], config.WaitForText);
      await I.click(pageContent.saveAndContinueButtonText[language]);
      await I.see(pageContent.telephoneNunberHeadingCarm[language]);
      await I.fillField(fields.contactNumber, '02088908876');
      await I.click(pageContent.saveAndContinueButtonText[language]);
    } else {
      await I.waitForText(pageContent.phoneNumberHeading[language], config.WaitForText);
      await I.fillField(fields.contactNumber, '02088908876');
      await I.click(buttons.saveAndContinue);
    }
  }
}

module.exports = ContactNumberDetailsPage;
