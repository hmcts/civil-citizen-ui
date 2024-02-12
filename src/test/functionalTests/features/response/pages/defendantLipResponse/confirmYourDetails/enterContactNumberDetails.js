const I = actor();
const config = require('../../../../../../config');

const fields = {
  contactNumber: 'input[id="telephoneNumber"]',
};

const buttons = {
  saveAndContinue: 'button.govuk-button',
  saveAndContinueText: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau'
  }
};

const content = {
  heading1Carm: {
    en: 'Enter a phone number',
    cy: 'Rhowch rif ffôn' 
  },
  heading2Carm: {
    en: 'Enter telephone number',
    cy: '', //TODO
  },
  heading: {
    en: 'Enter a phone number (optional)',
    cy: 'Rhowch rif ffôn (dewisol)'
  },
}

const inputs = {
  contactNumber: {
    en: '02088908876',
    cy: '02920456789'
  }
}

class ContactNumberDetailsPage {
  async enterContactNumber(carmEnabled = false, language = 'en') {
    if (carmEnabled) {
      await I.waitForText(content.heading1Carm[language], config.WaitForText);
      await I.click(content.saveAndContinueButtonText[language]);
      await I.see(content.heading2Carm[language]);
      await I.fillField(fields.contactNumber, inputs.contactNumber[language]);
      await I.click(buttons.saveAndContinueText[language]);
    } else {
      await I.waitForText(content.heading[language], config.WaitForText);
      await I.fillField(fields.contactNumber, inputs.contactNumber[language]);
      await I.click(buttons.saveAndContinue);
    }
  }
}

module.exports = ContactNumberDetailsPage;
