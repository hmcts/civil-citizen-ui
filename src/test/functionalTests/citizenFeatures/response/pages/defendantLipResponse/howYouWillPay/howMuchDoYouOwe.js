const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');
const cButtons = require('../../../../../commonComponents/cButtons');

const fields ={
  amount: 'input[id="amount"]',
};

const content = {
  heading: {
    en: 'How much money do you admit you owe?',
    cy: 'Faint o arian ydych chi\'n cyfaddef sy\'n ddyledus gennych?',
  },
  hintText: (amount) => ({
    en: `The total amount, including any interest claimed to date, is £${amount}.`,
    cy: `Y cyfanswm, gan gynnwys unrhyw log a hawlir hyd yn hyn, yw £${amount}.`,
  }),
};

class HowMuchDoYouOwe {

  async enterHowMuchMoneyDoYouOwe(claimRef, amount, partAdmit, totalAmount) {
    const { language } = sharedData;
    await I.amOnPage('/case/'+claimRef+'/response/partial-admission/how-much-do-you-owe');
    await I.waitForContent(content.heading[language], config.WaitForText);
    await I.see(content.hintText(totalAmount)[language]);
    await I.fillField(fields.amount, amount);
    await I.click(cButtons.saveAndContinue[language]);
  }

  async enterHowMuchMoneyDoYouOweError(claimRef, amount) {
    await I.amOnPage('/case/'+claimRef+'/response/partial-admission/how-much-do-you-owe');
    await I.waitForContent('How much money do you admit you owe?', config.WaitForText);
    await I.see(`The total amount, including any interest claimed to date, is £${amount}.`);
    //empty amount
    await I.click('Save and continue');
    await I.see('There was a problem');
    await I.see('Enter a valid amount');
    //amount>claim amount
    await I.fillField(fields.amount, '1000000000');
    await I.click('Save and continue');
    await I.see('There was a problem');
    await I.see('Enter a value less than the amount claimed');
  }
}

module.exports = HowMuchDoYouOwe;
