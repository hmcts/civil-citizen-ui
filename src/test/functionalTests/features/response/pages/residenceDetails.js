const I = actor();

const fields = {
  ownHome: 'input[id="residenceType"]',
  jointHome: 'input[id="residenceType-2"]',
  privateRental: 'input[id="residenceType-3"]',
  councilHouse: 'input[id="residenceType-4"]',
  other: 'input[id="residenceType-5"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class ResidenceDetails {

  selectResidenceType(residenceType) {
    I.see('Where do you live?', 'h1');
    switch (residenceType){
      case 'ownHome':{
        I.click(fields.ownHome);
        break;
      }
      case 'jointHome':{
        I.click(fields.jointHome);
        break;
      }
      case 'privateRental':{
        I.click(fields.privateRental);
        break;
      }
      case 'councilHouse':{
        I.click(fields.councilHouse);
        break;
      }
      case 'other':{
        I.click(fields.other);
        break;
      }
      default:{
        I.click(fields.ownHome);
        break;
      }
    }
    I.click(buttons.continue);
  }
}

module.exports = ResidenceDetails;