import I = CodeceptJS.I

const I: I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

export class PartAdmitAlreadyPaid {

  selectAlreadyPaid(option: string): void {
    I.see('Have you paid the claimant the amount you admit you owe?', 'h1');
    if(option == 'yes'){
      I.click(fields.yesButton);
    }else{
      I.click(fields.noButton);
    }
    I.click(buttons.continue);
  }
}
