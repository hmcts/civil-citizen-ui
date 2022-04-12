/**
 * This is a workaround for https://github.com/ministryofjustice/moj-frontend/issues/343.
 * For the workaround to work, add buttons using MoJ add-another library have to have their HTML ids added to
 * addButtonsIds list.
 * The logic below may have to be adjusted if future duplicated/added items have different error classes.
 * Future pages using MoJ add-another component can leverage this logic by defining the id attribute in the add button
 * (of class 'moj-add-another__add-button') and adding that id the array below.
 * Once the issue above addressed, MoJ library can be upgraded and this workaround can be discarded.
 */
const addButtonIds = [
  'add-another-court-order',
];

addButtonIds.forEach(addButtonId => document.getElementById(addButtonId).addEventListener('click', () => {
  [...document.getElementsByClassName('govuk-error-summary')]
    .forEach(errorSummary => errorSummary.classList.add('hide'));
  [...document.getElementsByClassName('govuk-error-message')]
    .forEach(errorMessage => errorMessage.classList.add('hide'));
  [...document.getElementsByClassName('govuk-input--error')]
    .forEach(inputError => inputError.classList.remove('govuk-input--error'));
  [...document.getElementsByClassName('govuk-form-group--error')]
    .forEach(errorMessage => {
      errorMessage.classList.add('govuk-form-group');
      errorMessage.classList.remove('govuk-form-group--error');
    });
}));
