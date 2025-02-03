document.addEventListener('DOMContentLoaded', function () {
  // Regular expression to match URLs corresponding to pages linking to payment portal"
  const urlPatterns = [
    /^\/claim\/\d+\/fee$/,
    /^\/case\/\d+\/case-progression\/pay-hearing-fee\/apply-help-fee-selection$/,
    /^\/case\/\d+\/case-progression\/make-payment-again$/,
    /^\/case\/\d+\/general-application\/\d*\/?apply-help-fee-selection$/,
    /^\/case\/\d+\/general-application\/\d+\/apply-help-additional-fee-selection$/,
  ];
  const path = window.location.pathname;
  if (urlPatterns.some(pattern => pattern.test(path))) {
    const form = document.getElementsByTagName('form')[0];
    if (form) {
      form.onsubmit = handleSubmit;
    }
  }
});

function handleSubmit(event) {
  const submitButton = event.target.querySelector('.govuk-button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
  }
  return true;
}
