const I = actor();

const seeBreadcrumbs = () => I.seeElement('nav.govuk-breadcrumbs');

module.exports = {
  seeBreadcrumbs,
};
