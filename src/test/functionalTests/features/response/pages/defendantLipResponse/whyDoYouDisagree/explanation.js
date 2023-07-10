
const I = actor();

const fields ={
  reason: 'textarea[id="text"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class Explanation {

  async enterExplanation() {
    await I.fillField(fields.reason, 'Test reason');
    await I.click(buttons.continue);    
  }
}

module.exports = Explanation;
