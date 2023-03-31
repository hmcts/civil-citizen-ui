
const I = actor();

const fields ={
  amount: 'input[id="amount"]',
};

class HowMuchDoYouOwe {

  enterHowMuchMoneyDoYouOwe(claimRef, amount) {
    I.amOnPage('/case/'+claimRef+'/response/partial-admission/how-much-do-you-owe');
    I.see('How much money do you admit you owe?', 'h1');
    I.see('This includes the claim fee and any interest.');
    I.fillField(fields.amount, amount);
    I.click('Save and continue');
  }
}

module.exports = HowMuchDoYouOwe;
