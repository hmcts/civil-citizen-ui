const I = actor();
const config = require('../../../../../../config');

const fields = {
  altEmailAddressTextField: 'input[id="alternativeEmailAddress"]',
};

class NextThreeMonthsDate {

  async enterNextThreeMonthsDate(claimRef) {
    await I.amOnPage('/case/' + claimRef + '/mediation/next-three-months');
    await I.waitForText('Are there any dates in the next 3 months', config.WaitForText);
    await I.click('Save and continue');
    await I.see('Choose option: Yes or No');
    await I.click('Yes');
    await I.click('Save and continue');
  }
}

module.exports = NextThreeMonthsDate;
