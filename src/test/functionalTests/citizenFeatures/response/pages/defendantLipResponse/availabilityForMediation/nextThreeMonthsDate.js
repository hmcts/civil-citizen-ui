const I = actor();
const config = require('../../../../../../config');
const ContactUs = require('../../../../common/contactUs');
const sharedData = require('../../../../../sharedData');

const contactUs = new ContactUs();

const fields = {
  yesButton: 'input[value="yes"]',
};

const content = {
  unavailabilityDates: {
    en: 'Are there any dates in the next 3 months',
    cy: 'A oes unrhyw ddyddiadau yn y 3 mis',
  },
  saveAndCotinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau',
  },
  choseYesNo: {
    en: 'Choose option: Yes or No',
    cy: 'Dewiswch opsiwn: Oes neu Nac oes',
  },
};

class NextThreeMonthsDate {

  async enterNextThreeMonthsDate() {
    const { language } = sharedData;
    await I.waitForContent(content.unavailabilityDates[language], config.WaitForText);
    await I.click(content.saveAndCotinue[language]);
    await I.see(content.choseYesNo[language]);
    await I.click(fields.yesButton);
    contactUs.verifyContactUs();
    await I.click(content.saveAndCotinue[language]);
  }
}

module.exports = NextThreeMonthsDate;
