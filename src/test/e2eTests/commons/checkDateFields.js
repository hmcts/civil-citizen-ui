const I = actor();

const checkDateFields = (date) => {
  I.see('Day', 'label.govuk-label');
  I.fillField('#day', date.getDate());
  I.see('Month', 'label.govuk-label');
  I.fillField('#month', date.getMonth() + 1);
  I.see('Year', 'label.govuk-label');
  I.fillField('#year', date.getFullYear());
};

module.exports = {
  checkDateFields,
};
