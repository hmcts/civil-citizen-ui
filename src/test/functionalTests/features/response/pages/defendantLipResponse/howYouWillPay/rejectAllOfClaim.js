const I = actor();
const config = require('../../../../../../config');

const fields ={
  alreadyPaid: 'input[id="option"]',
  disputeAll: 'input[id="option-2"]',
  disputeAllCounterClaim: 'input[id="option-3"]',
};
const buttons = {
  continue: '#main-content button.govuk-button',
};

class RejectAllOfClaim {
  async selectRejectAllReason(reason) {
    await I.waitForText('Why do you believe you don’t owe', config.WaitForText);
    switch (reason) {
      case 'alreadyPaid':{
        await I.click(fields.alreadyPaid);
        break;
      }
      case 'disputeAll':{
        await I.click(fields.disputeAll);
        break;
      }
      case 'disputeAllCounterClaim':{
        await I.click(fields.disputeAllCounterClaim);
        break;
      }
      default:{
        await I.click(fields.alreadyPaid);
      }
    }
    await I.click(buttons.continue);
  }
}

module.exports = RejectAllOfClaim;
