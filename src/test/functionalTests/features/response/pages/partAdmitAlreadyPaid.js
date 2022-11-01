const I= actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class PartAdmitAlreadyPaid {

  selectAlreadyPaid(option) {
    I.see('Have you paid the claimant the amount you admit you owe?', 'h1');
    if(option == 'yes'){
      I.click(fields.yesButton);
    }else{
      I.click(fields.noButton);
    }
    I.click(buttons.continue);
  }
}

module.exports = PartAdmitAlreadyPaid;