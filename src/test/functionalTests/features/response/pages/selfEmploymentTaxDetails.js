const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  amountYouOwe: 'input[id="amountYouOwe"]',
  reason: 'textarea[id="reason"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class SelfEmploymentTaxDetails {

  clickYesButton() {
    I.see('Are you behind on tax payments?', 'h1');
    I.click(fields.yesButton);
    I.fillField(fields.amountYouOwe, '2000');
    I.fillField(fields.reason, 'Last year pending');
    I.click(buttons.continue);
  }
  clickNoButton() {
    I.see('Are you behind on tax payments?', 'h1');
    I.click(fields.noButton);
    I.click(buttons.continue);
  }
}

module.exports = SelfEmploymentTaxDetails;