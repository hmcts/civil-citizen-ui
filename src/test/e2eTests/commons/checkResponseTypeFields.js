const {seeInTitle} = require('./seeInTitle');
const I = actor();

const checkResponseTypeFields = (responseType) => {
  seeInTitle('Your claim response');
  I.see('How do you respond to the claim?', 'h1.govuk-heading-l');
  I.see('Find out what each response means', '.govuk-details__summary-text');

  I.checkOption(`#${responseType}`);
  I.seeElement('//span[contains(., "I admit all of the claim")]');
  I.see('You agree you owe the full amount claimed.', 'div.govuk-hint');

  I.seeElement('//span[contains(., "I admit part of the claim")]');
  I.see('You agree you owe some money but not the full amount claimed.', 'div.govuk-hint');

  I.seeElement('//span[contains(., "I reject all of the claim")]');
  I.see('You\'ve either paid what you believe you owe or you reject the claim.', 'div.govuk-hint');

};

module.exports = {
  checkResponseTypeFields,
};
