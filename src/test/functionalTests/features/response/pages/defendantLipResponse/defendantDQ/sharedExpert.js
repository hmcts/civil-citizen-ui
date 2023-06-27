
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class SharedExpert {

  async SelectOptionForSharedExpert() {
    await I.see('Do you want to share an expert with the other party?', 'h1');
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = SharedExpert;
