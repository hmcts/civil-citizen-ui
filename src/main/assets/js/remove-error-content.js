/**
 * This is a workaround for https://github.com/ministryofjustice/moj-frontend/issues/343.
 * The logic below may have to be adjusted if future repeated/added items have different error classes.
 * Future CCUI pages using MoJ add-another component will automatically benefit from this logic
 * Once the issue above addressed, MoJ library can be upgraded and this workaround can be discarded.
 */

[...document.getElementsByClassName('moj-add-another__add-button')].forEach( addButton => addButton.addEventListener('click', () => {
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
