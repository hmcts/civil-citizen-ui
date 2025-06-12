const I = actor();
const config = require('../../../../../../config');

class SendDocumentsOrRequests {
  constructor() {
    this.options = {
      ENFORCEMENT_REQUESTS: {
        heading: 'Send enforcement requests',
        description: 'Enforcement requests cannot be uploaded using the Money claims system.',
      },
      CLAIM_DOCUMENTS_AND_EVIDENCE: {
        heading: 'Send claim documents and evidence',
        description: 'Your case is not at the correct stage for you to upload claim documents and evidence.',
      },
    };
  }

  async selectDocumentOrRequestOption(value) {
    const option = this.options[value];
    if (!option) {
      throw new Error(`Unknown option: ${value}`);
    }

    await I.waitForElement(`input[type="radio"][value="${value}"]`, config.WaitForText);
    await I.checkOption({ css: `input[type="radio"][value="${value}"]` });
    await I.click('Continue');

    await I.waitForContent(option.heading, config.WaitForText);
    await I.see(option.description);
  }

  async goBack() {
    await I.click('.govuk-back-link');
    await I.waitForContent('What documents do you want to send?', config.WaitForText);
  }
}

module.exports = SendDocumentsOrRequests;
