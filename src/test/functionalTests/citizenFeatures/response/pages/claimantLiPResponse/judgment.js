const I = actor();

const fields = {
  yes: 'input[id="option"]',
  no: 'input[id="option-2"]',
  amount: 'input[id="amount"]',
  payImmediately: 'input[id="type"]',
  signed: 'input[id="signed"]',
};

class Judgment {
  async raiseDefaultJudgment(claimRef) {
    await this.defendantDoB(claimRef);
    await this.paymentOptionsForDJFlow();
    await this.confirmationPage();
  }

  async raiseJudgmentByAdmissions(claimRef) {
    await this.hasDefendantPaid('JudgmentByAdmissions', claimRef);
    await this.judgmentAmount();
    await this.paymentOptions();
    await this.checkYourAnswers();
    await this.confirmationPage();
  }
  async ResponseToTheClaimforJBASetDate() {
    await I.waitForText('You have completed 0 of 3 sections');
    await I.click('View the defendant\'s response');
    await I.waitForText('The defendant’s response');
    await I.click('Continue');
    await I.waitForText('You have completed 1 of 3 sections');
    await I.click('Accept or reject their repayment plan');
    await I.click(fields.yes);
    await I.click('Save and continue');
    await I.waitForText('You have completed 2 of 4 sections');
    await I.click('Choose how to formalise repayment');
    await I.waitForText('Choose how to formalise repayment');
    await I.click('Request a CCJ');
    await I.click('Save and continue');
    await I.waitForText('You have completed 3 of 5 sections');
    await I.click('Request a County Court Judgment');
    await I.waitForText('Has the defendant paid some of the amount owed?');
    await I.click(fields.no);
    await I.click('Save and continue');
    await I.waitForText('Judgment amount');
    await I.click('Continue');
    await I.waitForText('You have completed 4 of 5 sections');
    await I.click('Check and submit your response');
    await I.waitForText('Check your answers');
    await I.click('Submit Response');
    await I.waitForText('You\'ve requested a County Court Judgment against the defendant.');
    await I.click('Go to your account');
  }
  async defendantDoB(claimRef){
    await I.click('.table-link');
    await I.waitForText('Wait for defendant to respond');
    await I.amOnPage('/case/' + claimRef + '/ccj/date-of-birth');
    await I.wait(10);
    await I.waitForContent('Do you know the defendant\'s date of birth?', 60);
    await I.click(fields.no);
    await I.click('Save and continue');
    await I.waitForContent('Has the defendant paid some of the amount owed?', 60);
    await I.click(fields.no);
    await I.click('Save and continue');
    await I.waitForContent('Judgment amount', 60);
    await I.click('Continue');
  }

  async hasDefendantPaid(judgmentByAdmissions, claimRef){
    if(judgmentByAdmissions === 'JudgmentByAdmissions')
    {
      await I.amOnPage('/case/' + claimRef + '/ccj/paid-amount');
    }
    await I.waitForContent('Has the defendant paid some of the amount owed?', 60);
    await I.click(fields.yes);
    await I.waitForContent('Amount already paid', 60);
    await I.fillField(fields.amount, '100');
    await I.click('Save and continue');
    await I.click('Continue');
  }

  async judgmentAmount(){
    await I.waitForContent('Judgment amount', 60);
    await I.see('The judgment will order the defendant to pay');
    await I.see('including your claim fee and any interest, as shown in this table:');
    await I.see('Amount');
    await I.see('Claim amount');
    await I.see('Claim fee amount');
    await I.see('Subtotal');
    await I.see('Minus amount already paid');
    await I.see('Total');
    await I.click('Continue');
  }

  async paymentOptions(){
    await I.waitForContent('Payment Options', 60);
    await I.see('I would like the defendant to pay:');
    await I.click(fields.payImmediately);
    await I.click('Save and continue');
  }

  async paymentOptionsForDJFlow(){
    await I.waitForContent('Payment Options', 60);
    await I.see('I would like the defendant to pay:');
    await I.click(fields.payImmediately);
    await I.click('Save and continue');
    await I.waitForContent('Check your answers', 60);
    await I.click(fields.signed);
    await I.click('Sign and submit');
  }

  async checkYourAnswers(){
    await I.waitForContent('Check your answers', 60);
    await I.see('Their details (defendant)');
    await I.see('Full name');
    await I.see('Address');
    await I.see('Email');
    await I.see('Payment');
    await I.see('Has the defendant paid you some of the amount owed?');
    await I.see('Amount already paid');
    await I.see('Total to be paid by defendant');
    await I.see('How you want the defendant to pay?');
    await I.see('Statement of truth');
    await I.see('The information on this page forms your response.');
    await I.see('You can see it on the response form after you submit.');
    await I.see('When you\'re satisfied that your answers are accurate, you should tick to "sign" this statement of truth on the form.');
    await I.see('I declare that the details I have given are true to the best of my knowledge.');
    await I.click(fields.signed);
    await I.click('Sign and submit');
  }

  async confirmationPage(){
    await I.waitForContent('County Court Judgment requested', 60);
  }
}

module.exports = Judgment;
