const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

const fields = {
  ownHome: 'input[id="residenceType"]',
  jointHome: 'input[id="residenceType-2"]',
  privateRental: 'input[id="residenceType-3"]',
  councilHouse: 'input[id="residenceType-4"]',
  other: 'input[id="residenceType-5"]',
};
const buttons = {
  saveAndContinue: 'button.govuk-button',
};

const content = {
  heading: {
    en: 'Where do you live?',
    cy: 'Ble ydych chi\'n byw?',
  },
};

class ResidenceDetails {

  async selectResidenceType(residenceType) {
    await I.waitForText(content.heading[sharedData.language], config.WaitForText);
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
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = ResidenceDetails;
