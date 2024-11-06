document.addEventListener('DOMContentLoaded', function () {
  // Regular expression to match URLs in the format "/claim/{id}/fee"
  const urlPattern = /^\/claim\/\d+\/fee$/;
  const path = window.location.pathname;
  if (urlPattern.test(path)) {
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
