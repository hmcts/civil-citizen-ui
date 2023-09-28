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

  async enterHowMuchMoneyDoYouOweError(claimRef) {
    await I.amOnPage('/case/'+claimRef+'/response/partial-admission/how-much-do-you-owe');
    await I.waitForText('How much money do you admit you owe?', config.WaitForText);
    await I.see('This includes the claim fee and any interest.');
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
