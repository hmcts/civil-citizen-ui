const I = actor();
const config = require('../../../../../../config');

class SolveProblem {
  constructor() {
    this.options = {
      SUBMIT_RESPONSE_CLAIM: {
        heading: 'Submit a response to a claim',
        description: 'If you cannot submit a response using the Money claims system you should contact the court for help.',
      },
      SEE_THE_CLAIM_ON_MY_ACCOUNT: {
        heading: 'See the claim on my account',
        description: 'If the claim has been issued and you cannot see it on the Money claims system, you should contact the court for help.',
      },
      VIEW_DOCUMENTS_ON_MY_ACCOUNT: {
        heading: 'See the documents on my account',
        description: 'Get support to view the documents on your account\n',
      },
      SOLVE_PROBLEM_SOMETHING_ELSE: {
        heading: 'Enter message details',
        description: 'Message subject',
      },
    };
  }

  async selectOption(value) {
    const option = this.options[value];
    if (!option) {
      throw new Error(`Unknown option: ${value}`);
    }

    await I.waitForElement(`input[type="radio"][value="${value}"]`, config.WaitForText);
    await I.checkOption({ css: `input[type="radio"][value="${value}"]` });
    await I.click('Continue');

  }

  async goBack() {
    await I.click('.govuk-back-link');
    await I.waitForContent('What are you trying to do?', config.WaitForText);
  }
}

module.exports = SolveProblem;
