const {clickButton} = require('../commons/clickButton');
const {buttonType} = require('../commons/buttonVariables');
const {seeInTitle} = require('../commons/seeInTitle');
const {seeBackLink} = require('../commons/seeBackLink');
const {yesAndNoCheckBoxOptionValue} = require('../commons/eligibleVariables');
const I = actor();

class HelpWithFees {
  applyHelpWithFees(claimId) {
    I.amOnPage(`case/${claimId}/case-progression/apply-help-with-fees`);
    seeInTitle('Help with fees');
    seeBackLink();
    I.see('Hearing', 'span.govuk-caption-l');
    I.see('Help with fees', 'h1.govuk-heading-l');

    I.see('Case number: 0000 0000 0000 0002', 'h2.govuk-body-l');
    I.see('Claim amount: £1,000', 'h2.govuk-body-l');
    I.seeElement('div.govuk-inset-text');
    I.seeElement('//span[contains(., "The hearing fee is: £70")]');
    I.see('Applying for help with fees does not guarantee your fee will be covered. You will need to meet the', 'p.govuk-body');
    I.see('eligibility criteria (opens in new tab)', 'a.govuk-link');
    I.see('Once you apply for help with fees, you should receive a decision from HM Courts and Tribunals Service (HMCTS) within 5 to 10 working days.', 'p.govuk-body');

    I.see('If your application for help with fees is accepted', 'span.govuk-body');
    I.see('Your fee will be paid in full and you will not need to make a payment.', 'p.govuk-body');

    I.see('If your application for help with fees is partially accepted', 'span.govuk-body');
    I.see('Some of the fee will be paid, but you\'ll need to pay the remaining balance. You can pay by phone.', 'p.govuk-body');

    I.see('If your application for help with fees is rejected', 'span.govuk-body');
    I.see('You\'ll need to pay the full balance. You can make the card payment online, or by phone.', 'p.govuk-body');

    I.see('Do you want to continue to apply for help with fees?', 'h2.govuk-heading-m');

    I.checkOption(`#${yesAndNoCheckBoxOptionValue.YES}`);

    I.see('Cancel', 'a.govuk-link');
    clickButton(buttonType.CONTINUE);

  }

  start() {
    I.seeInCurrentUrl('/case-progression/apply-help-with-fees/start');
    seeInTitle('Apply for help with fees');
    seeBackLink();
    I.see('Hearing', 'span.govuk-caption-l');
    I.see('Apply for help with fees', 'h1.govuk-heading-l');

    I.see('Case number: 0000 0000 0000 0002', 'h2.govuk-body-l');
    I.see('Claim amount: £1,000', 'h2.govuk-body-l');

    I.see('If you already have a help with fees reference number in relation to the claim issue fee or any application fees, you should not use this reference number for this application.', 'p.govuk-body');

    I.see('Instead, you should make a new help with fees application which will provide you with a new reference number. Note down this number and keep it safe as you will need it later in the process.', 'p.govuk-body');

    I.see('During your application, you will be asked for the number of your court or tribunal form. Enter \'hearing fee\' followed by short explanation, for example \'hearing fee small claims\' or \'hearing fee for fast track\'.', 'p.govuk-body');

    I.see('Once you have made your application, return to this page and click continue to proceed.', 'p.govuk-body');

    I.see('Apply for Help with Fees (open in a new window)', 'a.govuk-link');

    I.see('Cancel', 'a.govuk-link');
    clickButton(buttonType.CONTINUE);

  }

  referenceNumber() {
    I.seeInCurrentUrl('/case-progression/apply-help-with-fees/reference-number');

    seeInTitle('Pay hearing fee');
    seeBackLink();
    I.see('Hearing', 'span.govuk-caption-l');
    I.see('Help with fees', 'h1.govuk-heading-l');

    I.see('Case number: 0000 0000 0000 0002', 'h2.govuk-body-l');
    I.see('Claim amount: £1,000', 'h2.govuk-body-l');

    I.see('Do you have a help with fees reference number?', 'h2.govuk-heading-m');

    I.checkOption(`#${yesAndNoCheckBoxOptionValue.YES}`);

    I.fillField('#referenceNumber', 'HWF-A1B-23C');
    I.see('Cancel', 'a.govuk-link');
    clickButton(buttonType.CONTINUE);
    I.seeInCurrentUrl('/case-progression/pay-hearing-fee/confirmation');

  }

}

module.exports = new HelpWithFees();
