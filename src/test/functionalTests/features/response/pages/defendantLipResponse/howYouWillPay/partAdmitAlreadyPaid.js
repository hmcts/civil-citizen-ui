const I= actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};
const buttons = {
  continue: 'button.govuk-button',
};

class PartAdmitAlreadyPaid {

  async selectAlreadyPaid(option) {
    await I.see('Have you paid the claimant the amount you admit you owe?', 'h1');
    if(option == 'yes'){
      await I.click(fields.yesButton);
    }else{
      await I.click(fields.noButton);
    }
    await I.click(buttons.continue);
  }
}

module.exports = PartAdmitAlreadyPaid;