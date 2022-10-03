import I = CodeceptJS.I

const I: I = actor();

const fields ={
  alreadyPaid: 'input[id="option"]',
  disputeAll: 'input[id="option-2"]',
  disputeAllCounterClaim: 'input[id="option-3"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

export class RejectAllOfClaim {
  selectRejectAllReason(reason: string): void {
    switch (reason) {
      case 'alreadyPaid':{
        I.click(fields.alreadyPaid);
        break;
      }
      case 'disputeAll':{
        I.click(fields.disputeAll);
        break;
      }
      case 'disputeAllCounterClaim':{
        I.click(fields.disputeAllCounterClaim);
        break;
      }
      default:{
        I.click(fields.alreadyPaid);
      }
    }
    I.click(buttons.continue);
  }
}
