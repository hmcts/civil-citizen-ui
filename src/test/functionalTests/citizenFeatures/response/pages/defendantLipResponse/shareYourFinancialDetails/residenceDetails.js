const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields = {
  ownHome: 'input[id="residenceType"]',
  jointHome: 'input[id="residenceType-2"]',
  privateRental: 'input[id="residenceType-3"]',
  councilHouse: 'input[id="residenceType-4"]',
  other: 'input[id="residenceType-5"]',
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
