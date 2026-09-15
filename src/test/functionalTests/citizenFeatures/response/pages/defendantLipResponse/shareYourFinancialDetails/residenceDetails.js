const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields = {
  ownHome: 'input[value="OWN_HOME"]',
  jointHome: 'input[value="JOINT_OWN_HOME"]',
  privateRental: 'input[value="PRIVATE_RENTAL"]',
  councilHouse: 'input[value="COUNCIL_OR_HOUSING_ASSN_HOME"]',
  other: 'input[value="OTHER"]',
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
