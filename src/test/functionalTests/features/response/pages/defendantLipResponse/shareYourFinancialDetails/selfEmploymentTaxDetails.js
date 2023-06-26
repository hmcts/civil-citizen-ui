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

  async clickYesButton() {
    await I.see('Are you behind on tax payments?', 'h1');
    await I.click(fields.yesButton);
    await I.fillField(fields.amountYouOwe, '2000');
    await I.fillField(fields.reason, 'Last year pending');
    await I.click(buttons.continue);
  }
  
  async clickNoButton() {
    await I.see('Are you behind on tax payments?', 'h1');
    await I.click(fields.noButton);
    await I.click(buttons.continue);
  }
}

module.exports = SelfEmploymentTaxDetails;