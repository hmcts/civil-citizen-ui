const I = actor();
const config = require('../../../../../config');

const fields = {
  yes: 'input[id="option"]',
  no: 'input[id="option-2"]',
};

const buttons = {
  saveAndContinue: '#main-content button.govuk-button',
};

class DefendantAdmissionSSA {

  async verifyContent() {
    await I.waitForContent('Respond to the settlement agreement', config.WaitForText);
    await I.see('Sir John Doe will pay £1500 no later than 1 October 2025.');
    await I.see('The agreement');
    await I.see('Completion date');
    await I.see('This agreement settles the claim made by Miss Jane Doe against Sir John Doe.');
    await I.see('This includes all money owed in the claim, for example court fees, expenses or interest.');
    await I.see('Neither party can make any further claims relating to this case, other than to enforce it.');
    await I.see('Either party can view and download this agreement from their Money Claims account.');
    await I.see('Both parties should keep a copy of this agreement.');
    await I.see('If the agreement is broken');
    await I.see('The claimant can request a County Court Judgment (CCJ) for any money still owed from this agreement.');
    await I.see('Do you want to sign the settlement agreement?');
    await I.see('You can choose not to sign the settlement agreement, for example if you think you can\'t afford it.');
    await I.see('Make sure this agreement includes everything you’ve agreed with Miss Jane Doe before signing. ');
    await I.see('You won’t be able to change this later.');
    await I.see('Yes - I confirm I\'ve read and accept the terms of the agreement.');
    await I.see('No - I reject the terms of the agreement.');
  }

  async chooseOptionToSign(option){
    if(option === 'yes'){
      await I.click(fields.yes);
      await I.waitForContent('The claim will be put on hold and the claimant can\'t request a CCJ against you.');
    }else{
      await I.click(fields.no);
      await I.waitForContent('The claimant can request a CCJ against you to enforce the repayment plan shown in the agreement.');
      await I.see('You can ask a judge to change the plan based on your financial details.');
      await I.see('The court has reviewed the plan and believes you can afford it, so a judge may not change it.');
    }
    await I.click(buttons.saveAndContinue);
  }

  async verifyConfirmationPage(option){
    if(option === 'yes'){
      await I.waitForContent('Make sure you get receipts for any payments.');
      await I.see('You\'ve both signed a settlement agreement');
      await I.see('Download settlement agreement (PDF)');
      await I.see('The agreement says you\'ll repay by');
      await I.see('The claimant can\'t request a County Court Judgment against you unless you break the terms.');
      await I.see('What happens next');
      await I.see('Contact Miss Jane Doe if you need their payment details.');
      await I.see('Make sure you get receipts for any payments.');
      await I.see('Email');
      await I.see('Telephone');
    }else{
      await I.waitForContent('We\'ll email you when the claimant responds.');
      await I.see('You\'ve rejected the settlement agreement');
      await I.see('What happens next');
      await I.see('The claimant can request a County Court Judgment (CCJ) against you.');
      await I.see('The CCJ would order you to repay the money in line with the terms of the agreement.');
      await I.see('If they request a CCJ, you can ask a judge to consider changing the repayment plan, based on your financial details.');
      await I.see('The court has reviewed the plan and believes you can afford it, so a judge may not change it.');
      await I.see('We\'ll email you when the claimant responds.');
      await I.see('Email');
      await I.see('Telephone');
    }
  }
}

module.exports = DefendantAdmissionSSA;
