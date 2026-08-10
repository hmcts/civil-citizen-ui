const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields = {
  ownHome: 'input[id="type"]',
  jointHome: 'input[id="type-2"]',
  privateRental: 'input[id="type-3"]',
  councilHouse: 'input[id="type-4"]',
  other: 'input[id="type-5"]',
};

const content = {
  heading: {
    en: 'Where do you live?',
    cy: 'Ble ydych chi\'n byw?',
  },
};

class ResidenceDetails {

  async selectResidenceType(residenceType) {
    const { language } = sharedData;
    await I.waitForContent(content.heading[language], config.WaitForText);
    switch (residenceType){
      case 'ownHome':{
        await I.click(fields.ownHome);
        break;
      }
      case 'jointHome':{
        await I.click(fields.jointHome);
        break;
      }
      case 'privateRental':{
        await I.click(fields.privateRental);
        break;
      }
      case 'councilHouse':{
        await I.click(fields.councilHouse);
        break;
      }
      case 'other':{
        await I.click(fields.other);
        break;
      }
      default:{
        await I.click(fields.ownHome);
        break;
      }
    }
    await I.click(cButtons.saveAndContinue[language]);
  }
}

module.exports = ResidenceDetails;
