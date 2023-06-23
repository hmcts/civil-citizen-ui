
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class SharedExpert {

  SelectOptionForSharedExpert() {
    I.see('Do you want to share an expert with the other party?', 'h1');
    I.click(fields.yesButton);
    I.click('Save and continue');
  }
}

module.exports = SharedExpert;
