const I = actor();
const config = require('../../../../../../config');

class ManageHearingOptions {
  constructor() {
    this.options = {
      CHANGE_THE_HEARING_DATE: {
        heading: 'Change the hearing date',
        description: 'You should give the court dates when you would be able to attend a hearing. The other parties will also need to agree to the change.',
      },
      CHANGE_SOMETHING_ABOUT_THE_HEARING: {
        heading: 'Change something about the hearing',
        description: 'If you are applying to change the hearing date, you will have to pay a fee, the amount may be reduced if you are making more than one application.',
      },
      ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING: {
        heading: 'Ask for help and support during your hearing',
        description: 'To ask for support at your hearing you have to contact the court where the hearing is being held, you can see which court is hearing your case in your directions order.',
      },
      MANAGE_HEARING_SOMETHING_ELSE: {
        heading: 'Enter message details',
        description: 'Message details',
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
    await I.waitForContent('Manage your hearing', config.WaitForText);
  }
}

module.exports = ManageHearingOptions;
