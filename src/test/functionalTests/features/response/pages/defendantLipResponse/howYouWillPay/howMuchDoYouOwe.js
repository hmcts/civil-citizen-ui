const I = actor();
const config = require('../../../../../../config');

const fields ={
  amount: 'input[id="amount"]',
};

class HowMuchDoYouOwe {

  async enterHowMuchMoneyDoYouOwe(claimRef, amount) {
    await I.amOnPage('/case/'+claimRef+'/response/partial-admission/how-much-do-you-owe');
    await I.waitForText('How much money do you admit you owe?', config.WaitForText);
    await I.see('This includes the claim fee and any interest.');
    await I.fillField(fields.amount, amount);
    await I.click('Save and continue');
  }
}

module.exports = HowMuchDoYouOwe;
