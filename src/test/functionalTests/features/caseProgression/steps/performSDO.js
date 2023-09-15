const config = require('../../../../config');

const I = actor(); // eslint-disable-line no-unused-vars

class performSDOSteps {

  loadSDOPage(claimRef) {

    console.log('The value of the Claim Reference : '+claimRef);
    I.amOnPage(config.url.manageCase);

  }

}

module.exports = new performSDOSteps();
