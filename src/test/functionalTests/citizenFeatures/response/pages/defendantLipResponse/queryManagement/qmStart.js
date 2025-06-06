const I = actor();
const config = require('../../../../../../config');

class QmStart {

  async verifyAllContactOptionsPresent() {
    await I.waitForContent('What do you want to do?', config.WaitForText);
    const options = [
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
    for (const option of options) {
      await I.see(option);
    }
  }

  async selectSomethingElseOption() {
    await I.waitForText('What do you want to do?', config.WaitForText);
    await I.checkOption('Something else');
    await I.click('Continue');
  }
}

module.exports = QmStart;
