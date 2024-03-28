const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const content = {
  descriptionText1: {
    en: 'We\'ll ask you for the details then we\'ll send them to',
    cy: 'Byddwn yn eich gofyn am y manylion ac yna byddwn yn eu hanfon at',
  },
  descriptionText2: {
    en: 'If they reject your proposal, the court will make a new plan using your financial details.',
    cy: 'Os byddant yn gwrthod eich cynnig, bydd y llys yn llunio cynllun newydd gan ddefnyddio eich manylion ariannol.',
  },
  descriptionText3: {
    en: 'They can reject your proposal if they believe you can pay sooner.',
    cy: 'Gallant wrthod eich cynnig os ydynt yn credu y gallwch dalu’n gynt.',
  },
};

class ShareYouFinancialDetailsIntro {

  async open(claimRef) {
    const { language } = sharedData; 
    await I.amOnPage('/case/' + claimRef + '/response/statement-of-means/intro');
    await I.waitForContent(content.descriptionText1[language], config.WaitForText);
    await I.see(content.descriptionText2[language]);
    await I.see(content.descriptionText3[language]);
  }

  async clickContinue() {
    await I.click(cButtons.continue[sharedData.language]);
  }
}

module.exports = ShareYouFinancialDetailsIntro;
