
const I = actor();

const fields ={
  yesButton: 'input[id="declared"]',
  noButton: 'input[id="declared-2"]',
  claimNumber: 'input[id="rows[0][claimNumber]"]',
  amountYouOwe: 'input[id="rows[0][amount]"]',
  installment: 'input[id="rows[0][instalmentAmount]"]',
};
const buttons = {
  saveAndContinue: 'Save and continue',
};

class CourtOrders {

  async clickYesButton(claimref) {
    await I.see('Are you paying money as a result of any court orders?', 'h1');
    await I.click(fields.yesButton);
    await I.fillField(fields.claimNumber, claimref);
    await I.fillField(fields.amountYouOwe, '1000');
    await I.fillField(fields.installment, '120');
    await I.click(buttons.saveAndContinue);
  }
  async clickNoButton() {
    await I.see('Are you paying money as a result of any court orders?', 'h1');
    await I.click(fields.noButton);
    await I.click(buttons.saveAndContinue);
  }
}

module.exports = CourtOrders;