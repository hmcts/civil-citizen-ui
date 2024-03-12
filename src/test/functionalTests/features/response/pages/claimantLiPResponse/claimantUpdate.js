const I = actor();
const config = require('../../../../../config');

class ClaimantUpdate {
  async respondToClaim(claimRef) {
    await I.amOnPage('/dashboard/' + claimRef + '/claimant');
    await I.waitForText('About claim', config.WaitForText);
    await I.click('Respond to claim');
  }
}

module.exports = ClaimantUpdate;
