const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  numberOfPeople: 'input[id="numberOfPeople"]',
  otherDetails: 'textarea[id="details"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class OtherDependantDetails {

  clickYesButton() {
    I.see('Do you support anyone else financially?', 'h1');
    I.click(fields.yesButton);
    I.fillField(fields.numberOfPeople, '2');
    I.fillField(fields.otherDetails, 'Parents');
    I.click(buttons.continue);
  }
  clickNoButton() {
    I.see('Do you support anyone else financially?', 'h1');
    I.click(fields.noButton);
    I.click(buttons.continue);
  }
}

module.exports = OtherDependantDetails;