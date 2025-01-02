document.addEventListener('DOMContentLoaded', function () {
  // Regular expression to match URLs in the format "/claim/{id}/fee"
  const urlPatterns = [
    /^\/claim\/\d+\/fee$/,
    /^\/case\/\d+\/case-progression\/pay-hearing-fee\/apply-help-fee-selection$/,
    /^\/case\/\d+\/case-progression\/make-payment-again$/,
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
