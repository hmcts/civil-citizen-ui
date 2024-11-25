const config =  require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');
const I = actor();

const fields ={
  courtLocation: 'select[id="courtLocation"]',
  courtLocationReason: 'textarea[id="reason"]',
};

const content = {
  heading: {
    en: 'Please select your preferred court hearing location.',
    cy: 'Please select your preferred court hearing location.',
  },
  descriptionText: {
    en: 'You can ask for the hearing to be held at a specific court, for example, if you spend weekdays a long distance from your home. The court will consider both parties\' circumstances when deciding where to hold the hearing. Find your nearest court by postcode :',
    cy: 'You can ask for the hearing to be held at a specific court, for example, if you spend weekdays a long distance from your home. The court will consider both parties\' circumstances when deciding where to hold the hearing. Find your nearest court by postcode :',
  },
};

const inputs = {
  courtLocationReason: {
    en: 'Nearest court',
    cy: 'Llys agosaf',
  },
};

class CourtLocation {
  async selectPreferredCourtLocation() {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.descriptionText[language]);
    await I.selectOption(fields.courtLocation, config.defendantSelectedCourt);
    await I.fillField(fields.courtLocationReason, inputs.courtLocationReason[language]);
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = CourtLocation;
