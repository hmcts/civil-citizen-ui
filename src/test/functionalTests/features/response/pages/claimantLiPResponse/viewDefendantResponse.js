const I = actor();
const config = require("../../../../../config");

class DefendantResponse {
  async verifyDefendantResponse () {
    await I.click('View the defendant\'s response');
    await I.waitForText('The defendant’s response', config.WaitForText);
    await I.click('Continue');
  }
}

module.exports = DefendantResponse;
