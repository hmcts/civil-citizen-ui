const I = actor();

const seeBreadcrumbs = () => I.seeElement('div.govuk-breadcrumbs');

module.exports = {
  seeBreadcrumbs,
};
