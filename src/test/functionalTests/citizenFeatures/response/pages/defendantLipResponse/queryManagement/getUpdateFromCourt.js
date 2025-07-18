const I = actor();
const config = require('../../../../../../config');

class GetUpdateFromCourt {

  async selectGetUpdate(value) {
    await I.waitForElement(`input[type="radio"][value="${value}"]`, config.WaitForText);
    await I.checkOption({ css: `input[type="radio"][value="${value}"]` });
    await I.click('Continue');

    switch (value) {
      case 'GENERAL_UPDATE':
        await I.waitForContent('Get a general update on what is happening with the case', config.WaitForText);
        await I.see('We cannot give updates on emails, forms or applications you have already sent to us.');
        break;

      case 'CLAIM_NOT_PAID':
        await I.waitForContent('Understand what happens if the claim is not paid', config.WaitForText);
        await I.see('The defendant has up to 28 days to respond once they receive the claim.');
        break;

      case 'CLAIM_NOT_PAID_AFTER_JUDGMENT':
        await I.waitForContent('Understand what happens if the judgment is not paid', config.WaitForText);
        await I.see('If the claimant applies for a judgment and the defendant has not met the deadlines in the judgment, the claimant can still try and get their money.');
        break;

      default:
        throw new Error(`Unknown option: ${value}`);
    }
  }

  async goBack() {
    await I.click('.govuk-back-link');
    await I.waitForContent('Get an update on my case', config.WaitForText);
  }
}

module.exports = GetUpdateFromCourt;
