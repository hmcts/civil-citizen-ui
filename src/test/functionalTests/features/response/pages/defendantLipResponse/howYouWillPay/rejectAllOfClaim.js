const I = actor();

const fields ={
  alreadyPaid: 'input[id="option"]',
  disputeAll: 'input[id="option-2"]',
  disputeAllCounterClaim: 'input[id="option-3"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class RejectAllOfClaim {
  async selectRejectAllReason(reason) {
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