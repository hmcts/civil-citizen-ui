const I = actor();
const config = require('../../../../../../config');

class SendUpdateToCourt {
  constructor() {
    this.updateOptions = {
      PAID_OR_PARTIALLY_PAID_JUDGMENT: {
        heading: 'Update the court about a partially paid judgment or claim',
        description: 'If the defendant has paid part of the claim amount, you do not have to update the court.',
      },
      SETTLE_CLAIM: {
        heading: 'Settle a claim',
        description: 'update the claim in the online service by selecting tell us you’ve settled the claim',
      },
      AMEND_CLAIM_DETAILS: {
        heading: 'Amend the claim details',
        description: 'You must apply to amend the claim details, do this by making an application , you will have to pay a fee.',
      },
      CLAIM_ENDED: {
        heading: 'Tell the court my claim has ended',
        description: 'To tell the court you no longer want to continue with your claim',
      },
      SEND_UPDATE_SOMETHING_ELSE: {
        heading: 'Send a message',
        description: 'Sharing this message with the other party',
      },
    };
  }

  async selectSendUpdate(value) {
    const option = this.updateOptions[value];
    if (!option) {
      throw new Error(`Unknown option value: ${value}`);
    }
    await I.waitForElement(`input[type="radio"][value="${value}"]`, config.WaitForText);
    await I.checkOption({ css: `input[type="radio"][value="${value}"]` });
    await I.click('Continue');
    await I.waitForContent(option.heading, config.WaitForText);
    await I.see(option.description);
  }

  async goBack() {
    await I.click('.govuk-back-link');
    await I.waitForContent('Send an update on my case', config.WaitForText);
  }
}

module.exports = SendUpdateToCourt;
