
const I = actor();

const fields ={
  reason: 'textarea[id="text"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

export class Explanation {

  enterExplanation() {
    I.fillField(fields.reason, 'Test reason');
    I.click(buttons.continue);
  }
}
