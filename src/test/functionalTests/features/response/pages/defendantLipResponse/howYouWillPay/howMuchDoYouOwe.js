
const I = actor();

const fields ={
  amount: 'input[id="amount"]',
};

class HowMuchDoYouOwe {

  async enterHowMuchMoneyDoYouOwe(claimRef, amount) {
    await I.amOnPage('/case/'+claimRef+'/response/partial-admission/how-much-do-you-owe');
    await I.see('How much money do you admit you owe?', 'h1');
    await I.see('This includes the claim fee and any interest.');
    await I.fillField(fields.amount, amount);
    await I.click('Save and continue');
  }
}

module.exports = HowMuchDoYouOwe;
