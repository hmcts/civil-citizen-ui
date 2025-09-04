const I = actor();
const config = require('../../../../../../config');

class QmStart {
  constructor() {
    this.pageTitle = 'What do you want to do?';
    this.options = [
      'Ask the court to change something on your case (make an application)',
      'Get an update from the court',
      'Send an update to the court',
      'Send documents',
      'Solve a problem I am having using the Money claims system',
      'Manage your hearing',
      'Get support as the correspondence I received is unclear',
      'Follow up on an existing message',
      'Something else',
    ];

    this.optionMap = {
      askCourtToChange: this.options[0],
      getUpdate: this.options[1],
      sendUpdate: this.options[2],
      sendDocuments: this.options[3],
      solveProblem: this.options[4],
      manageHearing: this.options[5],
      getSupport: this.options[6],
      followUp: this.options[7],
      somethingElse: this.options[8],
    };
  }

  /**
   * Verifies all contact options are present on the page.
   */
  async verifyAllContactOptionsPresent() {
    await I.waitForContent(this.pageTitle, config.WaitForText);
    for (const option of this.options) {
      await I.see(option);
    }
  }

  /**
   * Selects a contact option by visible label text.
   * @param {string} optionLabel The exact label of the radio option to select.
   * @param {string} nextPageTitle The expected title after clicking continue (optional).
   */
  async selectOption(optionLabel) {
    await I.waitForContent(this.pageTitle, config.WaitForText);

    // Fail early if the option isn't visible
    if (!(await I.grabNumberOfVisibleElements(`//label[contains(text(),"${optionLabel}")]`))) {
      throw new Error(`Option "${optionLabel}" not found on the page!`);
    }

    await I.checkOption(optionLabel);
    await I.click('Continue');
  }

  async selectSomethingElseOption() {
    await this.selectOption(this.optionMap.somethingElse);
  }

  async getUpdateFromCourt() {
    await this.selectOption(this.optionMap.getUpdate, 'Get an update on my case');
  }

  async sendUpdateToTheCourt() {
    await this.selectOption(this.optionMap.sendUpdate, 'Send an update on my case');
  }

  async sendDocumentsToTheCourt() {
    await this.selectOption(this.optionMap.sendDocuments, 'What documents do you want to send?');
  }

  async solveProblem() {
    await this.selectOption(this.optionMap.solveProblem, 'What are you trying to do?');
  }

  async manageYourHearing() {
    // On this flow, the follow-up page title might be "What do you want to do about your hearing?" or similar
    await this.selectOption(this.optionMap.manageHearing, 'What do you want to do about your hearing?');
  }

  async getSupport() {
    await this.selectOption(this.optionMap.getSupport);
  }

  async followUpOnExistingMessage() {
    await this.selectOption(this.optionMap.followUp, 'Follow up on an existing message');
  }

  /**
   * Get the list of all available options.
   */
  getAvailableOptions() {
    return this.options;
  }
}

module.exports = QmStart;
