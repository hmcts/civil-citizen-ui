const I = actor();

const seeBackLink = () => I.seeElement('a.govuk-back-link');

module.exports = {
  seeBackLink,
};
