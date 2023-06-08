const config = require('../../../../../../../src/test/config.js');
// const config = require('../config.js');
const I = actor();

const fields = {
  signIn: 'input.button',
  username: 'input[id="username"]',
  password: 'input[id="password"]'
};

class claimantLatestUpdate {

  openClaimant(claimRef) {
    I.amOnPage(config.url.manageCase);
    I.fillField(fields.username, config.applicantSolicitorUser.email);
    I.fillField(fields.password, config.applicantSolicitorUser.password);
    I.click(fields.signIn);
    I.amOnPage(config.url.manageCase + '/cases/case-details/' + claimRef);
  }
}

module.exports = claimantLatestUpdate;
