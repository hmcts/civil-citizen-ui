
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class RequestExtraFourWeeks {

  SelectExtraFourWeeksToSettle() {
    I.see('Do you want an extra 4 weeks to try to settle the claim?', 'h1');
    I.click(fields.noButton);
    I.click('Save and continue');
  }
}

module.exports = RequestExtraFourWeeks;
